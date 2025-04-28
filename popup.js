// == Constants ==
const FILTER_CAPACITIES = {
  Nc: 1.0,
  C: 8.0,
  QTrigger: 2.0,
  QSource: 4.0,
};

const DAY_IN_MILLI = 1000 * 60 * 60 * 24;
const EPOCH_DURATION = 7 * DAY_IN_MILLI;
const WEEKS_TO_SHOW = 4;

// == Epoch Utils ==
const getEpochNow = () => Math.floor(Date.now() / EPOCH_DURATION);

const getEpochDateRange = (epoch) => {
  const startDate = new Date(epoch * EPOCH_DURATION);
  const endDate = new Date(startDate.getTime() + EPOCH_DURATION - 1);
  const formatDate = (date) => `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  return { firstDateStr: formatDate(startDate), lastDateStr: formatDate(endDate) };
};

// == Graph Utils ==
const drawChart = (canvasId, xAxisTitle, leftData, leftColor, leftLineY, rightData, rightColor, rightLineY) => {
  const ctx = document.getElementById(canvasId).getContext("2d");
  const allKeys = [...Object.keys(leftData), ...Object.keys(rightData)];
  const allValues = [...Object.values(leftData), ...Object.values(rightData)];
  const colors = [...Array(Object.keys(leftData).length).fill(leftColor), ...Array(Object.keys(rightData).length).fill(rightColor)];

  new Chart(ctx, {
    type: "bar",
    data: { labels: allKeys, datasets: [{ label: "Privacy Loss", data: allValues, backgroundColor: colors }] },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        annotation: {
          annotations: {
            line1: { type: "line", yMin: leftLineY, yMax: leftLineY, borderColor: leftColor, borderWidth: 2 },
            line2: { type: "line", yMin: rightLineY, yMax: rightLineY, borderColor: rightColor, borderWidth: 2 },
          },
        },
      },
      scales: {
        y: { beginAtZero: true, max: Math.max(leftLineY, rightLineY), title: { display: true, text: "Privacy Loss" } },
        x: { title: { display: true, text: xAxisTitle } },
      },
    },
  });
};

// == Historical Data Generation ==
const generateHistoricalMockData = () => {
  if (localStorage.getItem("historicalDataGenerated")) return;

  const sourceUris = ["www.nytimes.com", "www.blog.com", "www.cnn.com", "www.techcrunch.com", "www.reddit.com"];
  const triggerUris = ["www.nike.com", "www.toys.com", "www.amazon.com", "www.bestbuy.com", "www.target.com"];
  const epochNow = getEpochNow();

  for (let weekOffset = 1; weekOffset < WEEKS_TO_SHOW; weekOffset++) {
    const epoch = epochNow - weekOffset;
    navigator.privateAttribution.clearEvents();
    for (let i = 0; i < 5; i++) {
      const sourceUri = sourceUris[Math.floor(Math.random() * sourceUris.length)];
      const triggerUri = triggerUris[Math.floor(Math.random() * triggerUris.length)];
      navigator.privateAttribution.addMockEvent(epoch, sourceUri, [triggerUri], [triggerUri]);
    }
    triggerUris.forEach(triggerUri => navigator.privateAttribution.computeReportFor(triggerUri, sourceUris, [triggerUri]));
    savePrivacyLossForEpoch(epoch);
  }

  localStorage.setItem("historicalDataGenerated", true);
};

// == Current Week Data ==
const generateCurrentWeekData = () => {
  const sourceUris = ["www.nytimes.com", "www.blog.com", "www.cnn.com", "www.techcrunch.com", "www.reddit.com"];
  const triggerUris = ["www.nike.com", "www.toys.com", "www.amazon.com", "www.bestbuy.com", "www.target.com"];
  const epochNow = getEpochNow();

  navigator.privateAttribution.clearEvents();
  for (let i = 0; i < 10; i++) {
    const sourceUri = sourceUris[Math.floor(Math.random() * sourceUris.length)];
    const triggerUri = triggerUris[Math.floor(Math.random() * triggerUris.length)];
    navigator.privateAttribution.addMockEvent(epochNow, sourceUri, [triggerUri], [triggerUri]);
  }
  triggerUris.forEach(triggerUri => navigator.privateAttribution.computeReportFor(triggerUri, sourceUris, [triggerUri]));
  savePrivacyLossForEpoch(epochNow);
};

// == Save Privacy Loss ==
const savePrivacyLossForEpoch = (epoch) => {
  const data = {
    Nc: (FILTER_CAPACITIES["Nc"] - navigator.privateAttribution.getBudget("Nc", epoch, "www.nike.com")).toFixed(2),
    C: (FILTER_CAPACITIES["C"] - navigator.privateAttribution.getBudget("C", epoch, "")).toFixed(2),
    QTrigger: (FILTER_CAPACITIES["QTrigger"] - navigator.privateAttribution.getBudget("QTrigger", epoch, "www.nike.com")).toFixed(2),
    QSource: (FILTER_CAPACITIES["QSource"] - navigator.privateAttribution.getBudget("QSource", epoch, "www.nytimes.com")).toFixed(2)
  };
  let history = JSON.parse(localStorage.getItem("privacyLossHistory")) || {};
  history[epoch] = data;
  localStorage.setItem("privacyLossHistory", JSON.stringify(history));
};

// == Weekly Chart ==
const drawWeeklyPrivacyLossChart = () => {
  const epochNow = getEpochNow();
  const history = JSON.parse(localStorage.getItem("privacyLossHistory")) || {};

  const labels = [];
  const ncData = [], cData = [], qTriggerData = [], qSourceData = [];

  for (let i = WEEKS_TO_SHOW - 1; i >= 0; i--) {
    const epoch = epochNow - i;
    const { firstDateStr, lastDateStr } = getEpochDateRange(epoch);
    labels.push(`${firstDateStr} - ${lastDateStr}`);

    const data = history[epoch] || { Nc: 0, C: 0, QTrigger: 0, QSource: 0 };
    ncData.push(data.Nc);
    cData.push(data.C);
    qTriggerData.push(data.QTrigger);
    qSourceData.push(data.QSource);
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
      plugins: { title: { display: true, text: 'Privacy Loss per Week' } },
      scales: {
        y: { beginAtZero: true, max: maxY, title: { display: true, text: "Privacy Loss" } },
        x: { title: { display: true, text: "Week" } }
      }
    }
  });
};

const drawCollusionChart = () => {
  const ncWebsites = ["www.nike.com", "www.toys.com", "www.amazon.com", "www.bestbuy.com", "www.target.com"];
  const epochNow = getEpochNow();
  const cValue = FILTER_CAPACITIES["C"] - navigator.privateAttribution.getBudget("C", epochNow, "");
  const leftValues = { global: cValue };
  const rightValues = {};
  for (website of ncWebsites) {
    const baseUrl = website.replace("www.", "");
    rightValues[`per-site[${baseUrl}]`] = FILTER_CAPACITIES["Nc"] - navigator.privateAttribution.getBudget("Nc", epochNow, website);
  }
  drawChart("CollusionChart", "Privacy Filters", leftValues, "red", FILTER_CAPACITIES["C"], rightValues, "blue", FILTER_CAPACITIES["Nc"]);
};

const drawConvQuotaChart = () => {
  const epochNow = getEpochNow();
  const qConvWebsites = ["www.nike.com", "www.toys.com", "www.amazon.com", "www.bestbuy.com", "www.target.com"];
  const leftValues = {};
  for (website of qConvWebsites) {
    const baseUrl = website.replace("www.", "");
    leftValues[`conv-quota[${baseUrl}]`] = FILTER_CAPACITIES["QTrigger"] - navigator.privateAttribution.getBudget("QTrigger", epochNow, website);
  }
  drawChart("ConvQuotaChart", "Conversion Quota", leftValues, "orange", FILTER_CAPACITIES["QTrigger"], {}, "transparent", 0);
};

const drawImplQuotaChart = () => {
  const epochNow = getEpochNow();
  const qImplWebsites = ["www.nytimes.com", "www.blog.com", "www.cnn.com", "www.techcrunch.com", "www.reddit.com"];
  const rightValues = {};
  for (website of qImplWebsites) {
    const baseUrl = website.replace("www.", "");
    rightValues[`impl-quota[${baseUrl}]`] = FILTER_CAPACITIES["QSource"] - navigator.privateAttribution.getBudget("QSource", epochNow, website);
  }
  drawChart("ImplQuotaChart", "Impression Quota", {}, "transparent", 0, rightValues, "purple", FILTER_CAPACITIES["QSource"]);
};

// == Init ==
document.addEventListener("DOMContentLoaded", () => {
  generateHistoricalMockData();
  generateCurrentWeekData();
  drawWeeklyPrivacyLossChart();
  drawCollusionChart();
  drawConvQuotaChart();
  drawImplQuotaChart();
});
