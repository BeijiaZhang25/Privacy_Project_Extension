import {
  drawCollusionChart,
  drawImplQuotaChart,
  drawConvQuotaChart,
  drawWeeklyPrivacyLossChart,
} from "./drawChart.js";
import { renderTransparencyDashboard } from "./transparency.js";
import { generateRealisticMockEvents } from "./mock.js";
import { renderBudgetUsage } from "./budget.js";

document.addEventListener("DOMContentLoaded", async () => {
  navigator.privateAttribution.clearEvents();

  generateRealisticMockEvents(4);
  drawCollusionChart();
  drawConvQuotaChart();
  drawImplQuotaChart();

  drawWeeklyPrivacyLossChart();
  renderTransparencyDashboard();
  renderBudgetUsage();

  const tabButtons = document.querySelectorAll(".tab-button");
  const chartItems = document.querySelectorAll(".chart-item");

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
});
