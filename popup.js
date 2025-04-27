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

const generateMockEvents = () => {
  const sourceUris = [
    "www.nytimes.com",
    "www.blog.com",
    "www.cnn.com",
    "www.techcrunch.com",
    "www.reddit.com",
    "www.medium.com",
    "www.quora.com",
  ];
  const randomSourceUri = () =>
    sourceUris[Math.floor(Math.random() * sourceUris.length)];

  const triggerUris = [
    "www.nike.com",
    "www.toys.com",
    "www.amazon.com",
    "www.bestbuy.com",
    "www.target.com",
    "www.homedepot.com",
    "www.sephora.com",
    "www.etsy.com",
  ];
  const randomTriggerUri = () =>
    triggerUris[Math.floor(Math.random() * triggerUris.length)];

  const epochNow = getEpochNow();

  navigator.privateAttribution.clearEvents();

  for (let i = 0; i < 10; i++) {
    const sourceUri = randomSourceUri();
    const triggerUri = randomTriggerUri();

    navigator.privateAttribution.addMockEvent(
      epochNow,
      sourceUri,
      [triggerUri],
      [triggerUri]
    );
  }

  for (const triggerUri of triggerUris) {
    navigator.privateAttribution.computeReportFor(triggerUri, sourceUris, [
      triggerUri,
    ]);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  generateMockEvents();
  drawCollusionChart();
  drawConvQuotaChart();
  drawImplQuotaChart();
});
