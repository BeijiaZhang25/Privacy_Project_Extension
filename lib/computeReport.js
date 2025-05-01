import { saveReportCall } from "./indexedDb.js";

export function computeReport(triggerUri, sourceUris) {
  const result = navigator.privateAttribution.computeReportFor(
    triggerUri,
    sourceUris,
    [triggerUri]
  );

  saveReportCall({
    trigger: triggerUri,
    sources: sourceUris,
    timestamp: new Date().toISOString(),
  });
}
