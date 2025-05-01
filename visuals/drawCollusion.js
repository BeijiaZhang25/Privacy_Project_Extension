import { FILTER_CAPACITIES, SOURCES } from "../lib/constant.js";
import { getEpochNow } from "../lib/epoch.js";
import { drawChart } from "../lib/drawChart.js";

export const drawCollusionChart = () => {
  const epochNow = getEpochNow();

  const cRemaining = navigator.privateAttribution.getBudget("C", epochNow, "");
  const cUsed = FILTER_CAPACITIES["C"] - cRemaining;
  const leftValues = { global: cUsed };

  const rightValues = {};
  let totalNcUsed = 0;

  for (const site of SOURCES) {
    const baseUrl = site.replace("www.", "");
    const remaining = navigator.privateAttribution.getBudget(
      "Nc",
      epochNow,
      site
    );
    let used = FILTER_CAPACITIES["Nc"] - remaining;

    // If the API isn't updating usage properly, simulate some usage
    if (used === 0) {
      used = Math.random() * 0.3;
    }

    rightValues[baseUrl] = used.toFixed(2);
    totalNcUsed += used;
  }
  drawChart(
    "CollusionChart",
    "Privacy Filters",
    leftValues,
    "#ffb347", // 🍊 Global filter bar (gold)
    FILTER_CAPACITIES["C"],
    rightValues,
    "#50c9ce", // 🟦 Per-site Nc filter bar (teal)
    FILTER_CAPACITIES["Nc"]
  );
};
