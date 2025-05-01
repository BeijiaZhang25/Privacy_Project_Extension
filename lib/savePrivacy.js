import { FILTER_CAPACITIES, SOURCES, TRIGGERS } from "./constant.js";

export const savePrivacyLossForEpoch = (epoch) => {
  let cUsed =
    FILTER_CAPACITIES["C"] -
    navigator.privateAttribution.getBudget("C", epoch, "");

  let ncUsed = 0;
  for (const source of SOURCES) {
    const remaining = navigator.privateAttribution.getBudget(
      "Nc",
      epoch,
      source
    );
    ncUsed += FILTER_CAPACITIES["Nc"] - remaining;
  }

  let qSourceUsed = 0;
  for (const source of SOURCES) {
    const remaining = navigator.privateAttribution.getBudget(
      "QSource",
      epoch,
      source
    );
    qSourceUsed += FILTER_CAPACITIES["QSource"] - remaining;
  }

  let qTriggerUsed = 0;
  for (const trigger of TRIGGERS) {
    const remaining = navigator.privateAttribution.getBudget(
      "QTrigger",
      epoch,
      trigger
    );
    qTriggerUsed += FILTER_CAPACITIES["QTrigger"] - remaining;
  }

  const data = {
    C: cUsed.toFixed(2),
    Nc: ncUsed.toFixed(2),
    QSource: qSourceUsed.toFixed(2),
    QTrigger: qTriggerUsed.toFixed(2),
  };

  let history = JSON.parse(localStorage.getItem("privacyLossHistory")) || {};
  history[epoch] = data;
  localStorage.setItem("privacyLossHistory", JSON.stringify(history));
};
