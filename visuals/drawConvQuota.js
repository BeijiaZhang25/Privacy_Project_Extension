import { getEpochNow } from "../lib/epoch.js";
import { drawChart } from "../lib/drawChart.js";
import { FILTER_CAPACITIES, TRIGGERS } from "../lib/constant.js";

export const drawConvQuotaChart = () => {
  const epochNow = getEpochNow();
  const leftValues = {};

  for (const website of TRIGGERS) {
    const baseUrl = website.replace("www.", "");
    let remaining = navigator.privateAttribution.getBudget(
      "QTrigger",
      epochNow,
      website
    );
    let used = FILTER_CAPACITIES["QTrigger"] - remaining;

    if (used === 0) {
      used = Math.random() * 0.5;
    }

    leftValues[`conv-quota[${baseUrl}]`] = used.toFixed(2);
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
