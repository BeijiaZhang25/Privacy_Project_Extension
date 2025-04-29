import { EPOCH_DURATION, FILTER_CAPACITIES } from "./const.js";

export const getEpochNow = () => Math.floor(Date.now() / EPOCH_DURATION);

export const getEpochDateRange = (epoch) => {
  const startDate = new Date(epoch * EPOCH_DURATION);
  const endDate = new Date(startDate.getTime() + EPOCH_DURATION - 1);
  const formatDate = (date) =>
    `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  return {
    firstDateStr: formatDate(startDate),
    lastDateStr: formatDate(endDate),
  };
};

export const savePrivacyLossForEpoch = (epoch) => {
  const data = {
    Nc: (
      FILTER_CAPACITIES["Nc"] -
      navigator.privateAttribution.getBudget("Nc", epoch, "www.nike.com")
    ).toFixed(2),
    C: (
      FILTER_CAPACITIES["C"] -
      navigator.privateAttribution.getBudget("C", epoch, "")
    ).toFixed(2),
    QTrigger: (
      FILTER_CAPACITIES["QTrigger"] -
      navigator.privateAttribution.getBudget("QTrigger", epoch, "www.nike.com")
    ).toFixed(2),
    QSource: (
      FILTER_CAPACITIES["QSource"] -
      navigator.privateAttribution.getBudget(
        "QSource",
        epoch,
        "www.nytimes.com"
      )
    ).toFixed(2),
  };
  let history = JSON.parse(localStorage.getItem("privacyLossHistory")) || {};
  history[epoch] = data;
  localStorage.setItem("privacyLossHistory", JSON.stringify(history));
};
