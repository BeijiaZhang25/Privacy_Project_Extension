import { SOURCES, TRIGGERS, FILTER_CAPACITIES } from "./const.js";
import { getEpochNow } from "./epoch.js";

export function getBudgetUsedPerCompany() {
  const epoch = getEpochNow();
  const budgetUsed = [];

  for (const company of TRIGGERS) {
    const used =
      FILTER_CAPACITIES["QTrigger"] -
      navigator.privateAttribution.getBudget("QTrigger", epoch, company);
    budgetUsed.push({ company, type: "Trigger", used: used.toFixed(2) });
  }

  for (const company of SOURCES) {
    const used =
      FILTER_CAPACITIES["QSource"] -
      navigator.privateAttribution.getBudget("QSource", epoch, company);
    budgetUsed.push({ company, type: "Source", used: used.toFixed(2) });
  }

  return budgetUsed.sort((a, b) => b.used - a.used);
}

export function renderBudgetUsage() {
  const ctx = document.getElementById("BudgetUsageChart").getContext("2d");
  const budgetUsage = getBudgetUsedPerCompany();

  // Pick top 5 or top 10 companies only (optional)
  const topCompanies = budgetUsage.slice(0, 8);

  const labels = topCompanies.map((entry) => entry.company.replace("www.", ""));
  const data = topCompanies.map((entry) => entry.used);

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            "#4F81BD",
            "#5DA5DA",
            "#60BD68",
            "#F15854",
            "#B276B2",
            "#DECF3F",
            "#FAA43A",
            "#FF9896",
          ],
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Privacy Budget Usage by Company",
        },
        legend: {
          position: "bottom",
        },
      },
    },
  });
}
