import { getEpochNow } from "../lib/epoch.js";
import { drawChart } from "../lib/drawChart.js";
import { FILTER_CAPACITIES, SOURCES } from "../lib/constant.js";

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
