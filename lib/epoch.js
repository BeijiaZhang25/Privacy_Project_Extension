import { EPOCH_DURATION } from "./constant.js";

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
