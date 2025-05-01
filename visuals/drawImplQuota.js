import { getEpochNow } from "../lib/epoch.js";
import { drawChart } from "../lib/drawChart.js";
import { FILTER_CAPACITIES, SOURCES } from "../lib/constant.js";

export const drawImplQuotaChart = () => {
  const epochNow = getEpochNow();
  const rightValues = {};

  for (const website of SOURCES) {
    const baseUrl = website.replace("www.", "");
    let remaining = navigator.privateAttribution.getBudget(
      "QSource",
      epochNow,
      website
    );
    let used = FILTER_CAPACITIES["QSource"] - remaining;

    if (used === 0) {
      used = Math.random() * 0.5;
    }

    rightValues[`impl-quota[${baseUrl}]`] = used.toFixed(2);
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
