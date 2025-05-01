// import { WEEKS_TO_SHOW } from "./constant.js";
import { getEpochNow } from "./epoch.js";
import { addMockEvent } from "./addMockEvent.js";
import { computeReport } from "./computeReport.js";
import { savePrivacyLossForEpoch } from "./savePrivacy.js";
import { SOURCES, TRIGGERS } from "./constant.js";

export const generateHistoricalMockData = () => {
  if (localStorage.getItem("historicalDataGenerated")) return;

  const epochNow = getEpochNow();

  for (let weekOffset = 1; weekOffset < 4; weekOffset++) {
    const epoch = epochNow - weekOffset;
    navigator.privateAttribution.clearEvents();

    for (const sourceUri of SOURCES) {
      const triggerUri = TRIGGERS[Math.floor(Math.random() * TRIGGERS.length)];

      // Add multiple events to increase attribution chance
      for (let i = 0; i < 3; i++) {
        addMockEvent(epoch, sourceUri, triggerUri);
      }

      // Ensure each trigger gets a report computed
      computeReport(triggerUri, [sourceUri]);
    }

    savePrivacyLossForEpoch(epoch);
  }

  localStorage.setItem("historicalDataGenerated", true);
};

export const generateCurrentWeekData = () => {
  const epochNow = getEpochNow();
  navigator.privateAttribution.clearEvents();

  for (const sourceUri of SOURCES) {
    const triggerUri = TRIGGERS[Math.floor(Math.random() * TRIGGERS.length)];

    for (let i = 0; i < 3; i++) {
      addMockEvent(epochNow, sourceUri, triggerUri);
    }

    computeReport(triggerUri, [sourceUri]);
  }

  savePrivacyLossForEpoch(epochNow);
};
