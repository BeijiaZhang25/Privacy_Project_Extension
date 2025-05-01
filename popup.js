import {
  generateCurrentWeekData,
  generateHistoricalMockData,
} from "./lib/generate.js";

import { drawWeeklyPrivacyLossChart } from "./visuals/drawWeeklyPrivacyLoss.js";
import { drawCollusionChart } from "./visuals/drawCollusion.js";
import { drawConvQuotaChart } from "./visuals/drawConvQuota.js";
import { drawImplQuotaChart } from "./visuals/drawImplQuota.js";
import { renderTransparencyDashboard } from "./visuals/renderTransparencyDashboard.js";

document.addEventListener("DOMContentLoaded", async () => {
  navigator.privateAttribution.clearEvents();

  generateHistoricalMockData();
  generateCurrentWeekData();
  drawCollusionChart();
  drawConvQuotaChart();
  drawImplQuotaChart();

  drawWeeklyPrivacyLossChart();
  renderTransparencyDashboard();
});

const tabButtons = document.querySelectorAll(".tab-button");
const chartItems = document.querySelectorAll(".chart-item");
const icon = document.querySelector(".info-icon");
const tooltip = document.getElementById("CollusionInfoTooltip");

if (icon && tooltip) {
  icon.addEventListener("click", () => {
    tooltip.style.display = tooltip.style.display === "none" ? "block" : "none";
  });
}
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove active class from all buttons
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    // Hide all chart items
    chartItems.forEach((item) => item.classList.remove("active"));

    // Show the selected chart item
    const targetId = button.dataset.target;
    document.getElementById(targetId).classList.add("active");
  });
});
