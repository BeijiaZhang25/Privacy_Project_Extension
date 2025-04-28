// hard-coded to match pdslib-firefox's capacities
const FILTER_CAPACITIES = {
  Nc: 1.0,
  C: 8.0,
  QTrigger: 2.0,
  QSource: 4.0,
};

// == graph utils ==
const drawChart = (
  canvasId,
  xAxisTitle,
  leftData,
  leftColor,
  leftLineY,
  rightData,
  rightColor,
  rightLineY
) => {
  const ctx = document.getElementById(canvasId).getContext("2d");

  const leftKeys = Object.keys(leftData);
  const leftValues = Object.values(leftData);
  const rightKeys = Object.keys(rightData);
  const rightValues = Object.values(rightData);

  const colors = [];
  for (let i = 0; i < leftValues.length; i++) {
    colors.push(leftColor);
  }
  for (let i = 0; i < rightValues.length; i++) {
    colors.push(rightColor);
  }

  const allKeys = [...leftKeys, ...rightKeys];
  const allValues = [...leftValues, ...rightValues];

  const dataset = {
    label: "Privacy Loss",
    data: allValues,
    backgroundColor: colors,
  };

  new Chart(ctx, {
    type: "bar",
    data: { labels: allKeys, datasets: [dataset] },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        annotation: {
          annotations: {
            line1: {
              type: "line",
              yMin: leftLineY,
              yMax: leftLineY,
              borderColor: leftColor,
              borderWidth: 2,
            },
            line2: {
              type: "line",
              yMin: rightLineY,
              yMax: rightLineY,
              borderColor: rightColor,
              borderWidth: 2,
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: Math.max(leftLineY, rightLineY),
          title: { display: true, text: "Privacy Loss" },
        },
        x: {
          title: { display: true, text: xAxisTitle },
        },
      },
    },
  });
};

// == epoch utils ==
const DAY_IN_MILLI = 1000 * 60 * 60 * 24;
const EPOCH_DURATION = 7 * DAY_IN_MILLI;

const getEpochNow = () => {
  const now = Date.now();
  return Math.floor(now / EPOCH_DURATION);
};

const drawCollusionChart = () => {
  const ncWebsites = ["www.nike.com", "www.toys.com", "www.amazon.com",
    "www.bestbuy.com",
    "www.target.com"];
  const epochNow = getEpochNow();

  const cValue =
    FILTER_CAPACITIES["C"] -
    navigator.privateAttribution.getBudget("C", epochNow, "");
  const leftValues = {
    global: cValue,
  };

  const rightValues = {};
  for (website of ncWebsites) {
    const baseUrl = website.replace("www.", "");
    const label = `per-site[${baseUrl}]`;

    rightValues[label] =
      FILTER_CAPACITIES["Nc"] -
      navigator.privateAttribution.getBudget("Nc", epochNow, website);
  }

  drawChart(
    "CollusionChart",
    "Privacy Filters",
    leftValues,
    "red",
    FILTER_CAPACITIES["C"],
    rightValues,
    "blue",
    FILTER_CAPACITIES["Nc"]
  );
};

const drawConvQuotaChart = () => {
  const epochNow = getEpochNow();
  const qConvWebsites = ["www.nike.com", "www.toys.com", "www.amazon.com",
    "www.bestbuy.com",
    "www.target.com"];

  const leftValues = {};
  for (website of qConvWebsites) {
    const baseUrl = website.replace("www.", "");
    const label = `conv-quota[${baseUrl}]`;

    leftValues[label] =
      FILTER_CAPACITIES["QTrigger"] -
      navigator.privateAttribution.getBudget("QTrigger", epochNow, website);
  }

  drawChart(
    "ConvQuotaChart",
    "Conversion Quota",
    leftValues,
    "orange",
    FILTER_CAPACITIES["QTrigger"],
    {},
    "transparent",
    0
  );
};

const drawImplQuotaChart = () => {
  const epochNow = getEpochNow();
  const qImplWebsites = ["www.nytimes.com", "www.blog.com",
    "www.cnn.com",
    "www.techcrunch.com",
    "www.reddit.com"];

  const rightValues = {};
  for (website of qImplWebsites) {
    const baseUrl = website.replace("www.", "");
    const label = `impl-quota[${baseUrl}]`;

    rightValues[label] =
      FILTER_CAPACITIES["QSource"] -
      navigator.privateAttribution.getBudget("QSource", epochNow, website);
  }

  drawChart(
    "ImplQuotaChart",
    "Impression Quota",
    {},
    "transparent",
    0,
    rightValues,
    "purple",
    FILTER_CAPACITIES["QSource"]
  );
};



const generateMockEvents = (weeksToShow = 4) => {
  const sourceUris = [
    "www.nytimes.com", "www.blog.com", "www.cnn.com",
    "www.techcrunch.com", "www.reddit.com", "www.medium.com", "www.quora.com"
  ];

  const triggerUris = [
    "www.nike.com", "www.toys.com", "www.amazon.com",
    "www.bestbuy.com", "www.target.com", "www.homedepot.com",
    "www.sephora.com", "www.etsy.com"
  ];

  const epochNow = getEpochNow();

  navigator.privateAttribution.clearEvents();  // Clear before generating

  for (let weekOffset = 0; weekOffset < weeksToShow; weekOffset++) {
    const epoch = epochNow - weekOffset;

    const eventsCount = weekOffset === 0 ? 10 : 5;

    for (let i = 0; i < eventsCount; i++) {
      const sourceUri = sourceUris[Math.floor(Math.random() * sourceUris.length)];
      const triggerUri = triggerUris[Math.floor(Math.random() * triggerUris.length)];

      navigator.privateAttribution.addMockEvent(epoch, sourceUri, [triggerUri], [triggerUri]);
    }

    for (const triggerUri of triggerUris) {
      navigator.privateAttribution.computeReportFor(triggerUri, sourceUris, [triggerUri]);
    }
  }
};
const getEpochDateRange = (epoch) => {
  const startDate = new Date(epoch * EPOCH_DURATION);
  const endDate = new Date(startDate.getTime() + EPOCH_DURATION - 1);

  const formatDate = (date) =>
    `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

  return {
    firstDateStr: formatDate(startDate),
    lastDateStr: formatDate(endDate),
  };
};

const drawWeeklyPrivacyLossChart = () => {
  const weeksToShow = 4;
  const epochNow = getEpochNow();

  const labels = [];
  const ncData = [];
  const cData = [];
  const qTriggerData = [];
  const qSourceData = [];

  for (let i = weeksToShow - 1; i >= 0; i--) {
    const epoch = epochNow - i;
    const { firstDateStr, lastDateStr } = getEpochDateRange(epoch);
    labels.push(`${firstDateStr} - ${lastDateStr}`);

    if (i === 0) {
      // Current week - real data
      ncData.push(FILTER_CAPACITIES["Nc"] - navigator.privateAttribution.getBudget("Nc", epoch, "www.nike.com"));
      cData.push(FILTER_CAPACITIES["C"] - navigator.privateAttribution.getBudget("C", epoch, ""));
      qTriggerData.push(FILTER_CAPACITIES["QTrigger"] - navigator.privateAttribution.getBudget("QTrigger", epoch, "www.nike.com"));
      qSourceData.push(FILTER_CAPACITIES["QSource"] - navigator.privateAttribution.getBudget("QSource", epoch, "www.nytimes.com"));
    } else {
      // Past weeks - simulate realistic data
      ncData.push((Math.random() * FILTER_CAPACITIES["Nc"]).toFixed(2));
      cData.push((Math.random() * FILTER_CAPACITIES["C"]).toFixed(2));
      qTriggerData.push((Math.random() * FILTER_CAPACITIES["QTrigger"]).toFixed(2));
      qSourceData.push((Math.random() * FILTER_CAPACITIES["QSource"]).toFixed(2));
    }
  }

  const ctx = document.getElementById("WeeklyPrivacyLossChart").getContext("2d");

  const maxY = Math.max(...ncData, ...cData, ...qTriggerData, ...qSourceData) + 1;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'nc-filter', data: ncData, backgroundColor: '#4F81BD' },
        { label: 'c-filter', data: cData, backgroundColor: '#5DA5DA' },
        { label: 'q-trigger', data: qTriggerData, backgroundColor: '#60BD68' },
        { label: 'q-source', data: qSourceData, backgroundColor: '#B2E061' }
      ]
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: 'Privacy Loss per Week'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: maxY,
          title: { display: true, text: "Privacy Loss" }
        },
        x: {
          title: { display: true, text: "Week" }
        }
      }
    }
  });
};


document.addEventListener("DOMContentLoaded", async () => {
  navigator.privateAttribution.clearEvents();

  generateMockEvents(4);
  drawCollusionChart();
  drawConvQuotaChart();
  drawImplQuotaChart();

  drawWeeklyPrivacyLossChart();
});
