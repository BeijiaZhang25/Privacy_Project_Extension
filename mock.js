import { getEpochNow } from "./epoch.js";
import { SOURCES, TRIGGERS } from "./const.js";
import { savePendingEvent, saveReportCall } from "./indexedDb.js";

export function addMockEvent(epoch, sourceUri, triggerUris) {
  navigator.privateAttribution.addMockEvent(
    epoch,
    sourceUri,
    triggerUris,
    triggerUris
  );

  savePendingEvent({
    epoch,
    source: sourceUri,
    trigger: triggerUris,
    timestamp: new Date().toISOString(),
  });
}

export function computeReport(triggerUri, sourceUris) {
  navigator.privateAttribution.computeReportFor(triggerUri, sourceUris, [
    triggerUri,
  ]);

  saveReportCall({
    trigger: triggerUri,
    sources: sourceUris,
    timestamp: new Date().toISOString(),
  });
}

function weightedRandom(items, weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const threshold = Math.random() * total;
  let runningTotal = 0;

  for (let i = 0; i < items.length; i++) {
    runningTotal += weights[i];
    if (runningTotal >= threshold) return items[i];
  }
}

export const generateRealisticMockEvents = (weeksToShow = 4) => {
  const sourceWeights = [5, 1, 4, 2, 5, 2, 2]; // Reddit, NYT heavier
  const triggerWeights = [6, 5, 5, 2, 4, 3, 2]; // Amazon, Nike, BestBuy heavier

  const epochNow = getEpochNow();
  navigator.privateAttribution.clearEvents();

  for (let weekOffset = 0; weekOffset < weeksToShow; weekOffset++) {
    const epoch = epochNow - weekOffset;

    const weekdayBoost = weekOffset === 0 ? 2 : 1; // more events current week
    const eventsCount = (weekOffset % 2 === 0 ? 10 : 5) * weekdayBoost;

    for (let i = 0; i < eventsCount; i++) {
      const sourceUri = weightedRandom(SOURCES, sourceWeights);
      const triggerUri = weightedRandom(TRIGGERS, triggerWeights);
      addMockEvent(epoch, sourceUri, [triggerUri]);
    }

    for (const triggerUri of TRIGGERS) {
      computeReport(triggerUri, SOURCES);
    }
  }
};
