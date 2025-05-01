import { saveReportCall } from "./indexedDb.js";

export function computeReport(triggerUri, sourceUris) {
  console.log("📤 computeReport called with:");
  console.log("  Trigger:", triggerUri);
  console.log("  Sources:", sourceUris);

  const result = navigator.privateAttribution.computeReportFor(
    triggerUri,
    sourceUris,
    [triggerUri]
  );
  console.log("🧾 Report result:", result);

  saveReportCall({
    trigger: triggerUri,
    sources: sourceUris,
    timestamp: new Date().toISOString(),
  });
}
