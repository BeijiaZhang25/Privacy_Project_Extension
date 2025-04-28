
console.log("Content script loaded!");
(function() {
    if (navigator.privateAttribution) {
      const epochNow = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
      const cBudget = navigator.privateAttribution.getBudget("C", epochNow, "");

      chrome.runtime.sendMessage({
        type: "privacyData",
        cBudget: cBudget
      });
    } else {
      console.warn("PrivateAttribution API is not available.");
    }
  })();

