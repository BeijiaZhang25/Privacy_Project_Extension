import { getAllPendingEvents, getAllReportCalls } from "./indexedDb.js";
import { formatDate } from "./indexedDb.js";

function getMostCommonTrigger(events) {
  const count = {};
  for (const ev of events) {
    for (const trigger of ev.trigger) {
      count[trigger] = (count[trigger] || 0) + 1;
    }
  }
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
}

function getAverageSourcesPerReport(reports) {
  if (reports.length === 0) return "N/A";
  const totalSources = reports.reduce((acc, r) => acc + r.sources.length, 0);
  return (totalSources / reports.length).toFixed(2);
}

export async function renderTransparencyDashboard() {
  const pendingEvents = await getAllPendingEvents();
  const reportCalls = await getAllReportCalls();
  pendingEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  reportCalls.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const transparencySummary = document.getElementById("transparency-summary");
  transparencySummary.innerHTML = `
  <div><strong>Total Pending Events:</strong> ${pendingEvents.length}</div>
  <div><strong>Total Reports Sent:</strong> ${reportCalls.length}</div>
  <div><strong>Most Common Trigger:</strong> ${getMostCommonTrigger(
    pendingEvents
  )}</div>
  <div><strong>Average Sources per Report:</strong> ${getAverageSourcesPerReport(
    reportCalls
  )}</div>
`;

  const pendingTable = document.getElementById("pending-events-body");
  pendingTable.innerHTML = pendingEvents
    .map(
      (ev) => `
    <tr>
      <td>${ev.epoch}</td>
      <td>${ev.source}</td>
      <td>${ev.trigger.join(", ")}</td>
    </tr>
  `
    )
    .join("");

  const reportTable = document.getElementById("report-calls-body");
  reportTable.innerHTML = reportCalls
    .map(
      (rep) => `
    <tr>
      <td>${formatDate(rep.timestamp)}</td>
      <td>${rep.trigger}</td>
      <td>${rep.sources.join(", ")}</td>
    </tr>
  `
    )
    .join("");
}
