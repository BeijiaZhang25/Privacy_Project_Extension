import { savePendingEvent } from "./indexedDb.js";

export function addMockEvent(epoch, sourceUri, triggerUris) {
  const triggers = Array.isArray(triggerUris) ? triggerUris : [triggerUris];

  navigator.privateAttribution.addMockEvent(
    epoch,
    sourceUri,
    triggers,
    triggers
  );

  savePendingEvent({
    epoch,
    source: sourceUri,
    trigger: triggers,
    timestamp: new Date().toISOString(),
  });
}
