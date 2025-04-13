document.addEventListener("DOMContentLoaded", () => {
  const privacyLossData = {
    "Mar 18-24": {
      "nc-filter": 0.8,
      "c-filter": 0.6,
      "q-trigger": 0.4,
      "q-source": 0.5,
    },
    "Mar 25-31": {
      "nc-filter": 0.9,
      "c-filter": 0.7,
      "q-trigger": 0.6,
      "q-source": 0.3,
    },
    "Apr 1-7": {
      "nc-filter": 0.4,
      "c-filter": 0.5,
      "q-trigger": 0.2,
      "q-source": 0.6,
    },
    "Apr 8-14": {
      "nc-filter": 0.3,
      "c-filter": 0.6,
      "q-trigger": 0.5,
      "q-source": 0.7,
    },
  };

  const weeks = Object.keys(privacyLossData);
  const filters = ["nc-filter", "c-filter", "q-trigger", "q-source"];

  const datasets = filters.map((filter, idx) => ({
    label: filter,
    data: weeks.map((week) => privacyLossData[week][filter]),
    backgroundColor: `rgba(${50 * idx}, ${100 + 30 * idx}, ${
      200 - 40 * idx
    }, 0.7)`,
  }));

  const ctx = document.getElementById("privacyChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: weeks,
      datasets: datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1.0,
          title: { display: true, text: "Privacy Loss" },
        },
        x: {
          title: { display: true, text: "Week" },
        },
      },
    },
  });
});
