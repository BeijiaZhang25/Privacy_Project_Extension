import {
  getAllPendingEvents,
  getAllReportCalls,
  formatDate,
} from "../lib/indexedDb.js";

export async function renderTransparencyDashboard() {
  const pendingEvents = await getAllPendingEvents();
  const reportCalls = await getAllReportCalls();
  pendingEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  reportCalls.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const pendingTable = document.getElementById("pending-events-body");
  pendingTable.innerHTML = pendingEvents
    .map(
      (ev) => `
    <tr>
      <td>${ev.epoch}</td>
      <td>${ev.source}</td>
      <td>${
        Array.isArray(ev.trigger) ? ev.trigger.join(", ") : ev.trigger || "N/A"
      }</td>
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
