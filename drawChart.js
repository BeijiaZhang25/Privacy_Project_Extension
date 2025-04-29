import { SOURCES, FILTER_CAPACITIES, WEEKS_TO_SHOW } from "./const.js";
import { getEpochDateRange, getEpochNow } from "./epoch.js";

export const drawChart = (
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
  const allKeys = [...Object.keys(leftData), ...Object.keys(rightData)];
  const allValues = [...Object.values(leftData), ...Object.values(rightData)];
  const colors = [
    ...Array(Object.keys(leftData).length).fill(leftColor),
    ...Array(Object.keys(rightData).length).fill(rightColor),
  ];

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: allKeys,
      datasets: [
        { label: "Privacy Loss", data: allValues, backgroundColor: colors },
      ],
    },
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
        x: { title: { display: true, text: xAxisTitle } },
      },
    },
  });
};

export const drawWeeklyPrivacyLossChart = () => {
  const epochNow = getEpochNow();
  const history = JSON.parse(localStorage.getItem("privacyLossHistory")) || {};

  const labels = [];
  const ncData = [],
    cData = [],
    qTriggerData = [],
    qSourceData = [];

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

  const ctx = document
    .getElementById("WeeklyPrivacyLossChart")
    .getContext("2d");
  const maxY =
    Math.max(...ncData, ...cData, ...qTriggerData, ...qSourceData) + 1;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        { label: "nc-filter", data: ncData, backgroundColor: "#4F81BD" },
        { label: "c-filter", data: cData, backgroundColor: "#5DA5DA" },
        { label: "q-trigger", data: qTriggerData, backgroundColor: "#60BD68" },
        { label: "q-source", data: qSourceData, backgroundColor: "#B2E061" },
      ],
    },
    options: {
      responsive: false,
      plugins: { title: { display: true, text: "Privacy Loss per Week" } },
      scales: {
        y: {
          beginAtZero: true,
          max: maxY,
          title: { display: true, text: "Privacy Loss" },
        },
        x: { title: { display: true, text: "Week" } },
      },
    },
  });
};

export const drawCollusionChart = () => {
  const epochNow = getEpochNow();
  const cValue =
    FILTER_CAPACITIES["C"] -
    navigator.privateAttribution.getBudget("C", epochNow, "");
  const leftValues = { global: cValue };
  const rightValues = {};
  for (const website of SOURCES) {
    const baseUrl = website.replace("www.", "");
    rightValues[`per-site[${baseUrl}]`] =
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

export const drawConvQuotaChart = () => {
  const epochNow = getEpochNow();

  const leftValues = {};
  for (const website of SOURCES) {
    const baseUrl = website.replace("www.", "");
    leftValues[`conv-quota[${baseUrl}]`] =
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

export const drawImplQuotaChart = () => {
  const epochNow = getEpochNow();

  const rightValues = {};
  for (const website of SOURCES) {
    const baseUrl = website.replace("www.", "");
    rightValues[`impl-quota[${baseUrl}]`] =
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
