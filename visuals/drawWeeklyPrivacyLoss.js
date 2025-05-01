import { getEpochNow, getEpochDateRange } from "../lib/epoch.js";
import { WEEKS_TO_SHOW } from "../lib/constant.js";

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
