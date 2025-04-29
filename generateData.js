import { getEpochNow, savePrivacyLossForEpoch } from "./epoch.js";
import { SOURCES, TRIGGERS, WEEKS_TO_SHOW } from "./const.js";

export const generateCurrentWeekData = () => {
  const epochNow = getEpochNow();

  navigator.privateAttribution.clearEvents();
  for (let i = 0; i < 10; i++) {
    const sourceUri = SOURCES[Math.floor(Math.random() * SOURCES.length)];
    const trigger = TRIGGERS[Math.floor(Math.random() * TRIGGERS.length)];
    navigator.privateAttribution.addMockEvent(
      epochNow,
      sourceUri,
      [trigger],
      [trigger]
    );
  }
  TRIGGERS.forEach((trigger) =>
    navigator.privateAttribution.computeReportFor(trigger, SOURCES, [trigger])
  );
  savePrivacyLossForEpoch(epochNow);
};

export const generateHistoricalMockData = () => {
  if (localStorage.getItem("historicalDataGenerated")) return;
  const epochNow = getEpochNow();

  for (let weekOffset = 1; weekOffset < WEEKS_TO_SHOW; weekOffset++) {
    const epoch = epochNow - weekOffset;
    navigator.privateAttribution.clearEvents();
    for (let i = 0; i < 5; i++) {
      const sourceUri = SOURCES[Math.floor(Math.random() * SOURCES.length)];
      const triggerUri = TRIGGERS[Math.floor(Math.random() * TRIGGERS.length)];
      navigator.privateAttribution.addMockEvent(
        epoch,
        sourceUri,
        [triggerUri],
        [triggerUri]
      );
    }
    TRIGGERS.forEach((triggerUri) =>
      navigator.privateAttribution.computeReportFor(triggerUri, SOURCES, [
        triggerUri,
      ])
    );
    savePrivacyLossForEpoch(epoch);
  }

  localStorage.setItem("historicalDataGenerated", true);
};
