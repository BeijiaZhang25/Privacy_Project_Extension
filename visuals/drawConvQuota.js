import { getEpochNow } from "../lib/epoch.js";
import { drawChart } from "../lib/drawChart.js";
import { FILTER_CAPACITIES, TRIGGERS } from "../lib/constant.js";

export const drawConvQuotaChart = () => {
  const epochNow = getEpochNow();
  const leftValues = {};
  for (const website of TRIGGERS) {
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
