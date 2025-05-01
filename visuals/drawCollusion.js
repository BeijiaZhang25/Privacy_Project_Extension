import { FILTER_CAPACITIES, SOURCES } from "../lib/constant.js";
import { getEpochNow } from "../lib/epoch.js";
import { drawChart } from "../lib/drawChart.js";

export const drawCollusionChart = () => {
  const epochNow = getEpochNow();
  console.log("📊 drawCollusionChart() called at epoch:", epochNow);

  const cRemaining = navigator.privateAttribution.getBudget("C", epochNow, "");
  const cUsed = FILTER_CAPACITIES["C"] - cRemaining;
  const leftValues = { global: cUsed };

  console.log("🔴 C filter — Remaining:", cRemaining, "| Used:", cUsed);

  const rightValues = {};
  let totalNcUsed = 0;

  for (const website of SOURCES) {
    const baseUrl = website.replace("www.", "");
    const used = Math.random() * 0.5; // simulate usage
    rightValues[`per-site[${baseUrl}]`] = used.toFixed(2);
    totalNcUsed += used;
    console.log(`🔵 Simulated Nc usage for ${website}:`, used.toFixed(2));
  }

  console.log("📦 Final leftValues (C):", leftValues);
  console.log("📦 Final rightValues (Nc):", rightValues);

  if (totalNcUsed === 0) {
    console.warn(
      "⚠️ No Nc filter usage detected — chart will only show global."
    );
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
