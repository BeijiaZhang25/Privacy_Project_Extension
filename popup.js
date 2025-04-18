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
          max: FILTER_CAPACITIES["C"],
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

/**
 * @returns {number} today's epoch number
 */
const getEpochNow = () => {
  const now = Date.now();
  return Math.floor(now / EPOCH_DURATION);
};

/**
 * @param {number} epochNumber - The epoch number to convert
 * @returns {Object} Object containing first/last days of the epoch
 */
const getEpochDateRange = (epochNumber) => {
  const startTimestamp = epochNumber * EPOCH_DURATION;
  const endTimestamp = startTimestamp + EPOCH_DURATION - 1;

  const firstDate = new Date(startTimestamp);
  const lastDate = new Date(endTimestamp);

  return {
    firstDate,
    lastDate,
    // formatted strings
    firstDateStr: firstDate.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
    }),
    lastDateStr: lastDate.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
    }),
  };
};

const drawCollusionChart = () => {
  const ncWebsites = ["www.nike.com", "www.toys.com"];
  const epochNow = getEpochNow();

  const cValue =
    FILTER_CAPACITIES["C"] -
    navigator.privateAttribution.getBudget("C", epochNow, "");
  const leftValues = {
    global: cValue,
  };

  const rightValues = {};
  for (website of ncWebsites) {
    // strip off www. for brievity
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

const drawQuotaChart = (uri) => {
  const epochNow = getEpochNow();

  // left = qConv = qTrigger
  // right = qImpl = qSource
  const qConvWebsites = ["www.nike.com", "www.toys.com"];
  const qImplWebsites = ["www.nytimes.com", "www.blog.com"];

  const leftValues = {};
  for (website of qConvWebsites) {
    // strip off www. for brievity
    const baseUrl = website.replace("www.", "");
    const label = `conv-quota[${baseUrl}]`;

    leftValues[label] =
      FILTER_CAPACITIES["QTrigger"] -
      navigator.privateAttribution.getBudget("QTrigger", epochNow, website);
  }

  const rightValues = {};
  for (website of qImplWebsites) {
    // strip off www. for brievity
    const baseUrl = website.replace("www.", "");
    const label = `impl-quota[${baseUrl}]`;

    rightValues[label] =
      FILTER_CAPACITIES["QSource"] -
      navigator.privateAttribution.getBudget("QSource", epochNow, website);
  }

  drawChart(
    "QuotaChart",
    "Quota Filters",
    leftValues,
    "orange",
    FILTER_CAPACITIES["QTrigger"],
    rightValues,
    "purple",
    FILTER_CAPACITIES["QSource"]
  );
};

/**
 *
 * @param {string} filterType
 * @param {Array<number>} epochs
 * @returns
 */
const getDataAndDrawGraph = (filterType, epochs, uri) => {
  if (!["Nc", "C", "QTrigger", "QSource"].includes(filterType)) {
    console.error("Invalid filter type:", filterType);
    return;
  }

  const data = {};
  for (const epoch of epochs) {
    let budget = navigator.privateAttribution.getBudget(filterType, epoch, uri);
    if (budget === -1.0) {
      console.warn("Budget is null for epoch:", epoch);
      budget = 0.0;
    }

    data[epoch] = FILTER_CAPACITIES[filterType] - budget;
  }

  drawChart(filterType, epochs, data);
};

// note: unused for now
const getCurrentUri = () => {
  return new Promise((resolve, reject) => {
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        if (tabs.length === 0) {
          reject(new Error("No active tab found"));
          return;
        }

        const url = new URL(tabs[0].url);
        resolve(url.hostname);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const generateMockEvents = () => {
  /* Idea/story:
   * the user has see ads for many products (nike.com, toys.com...)
   * on many other sites (nytimes.com, blog.com...)
   */

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
  drawQuotaChart();
});
