export const drawChart = (
  canvasId,
  xAxisTitle,
  leftData,
  leftColor,
  leftLineY,
  rightData,
  rightColor,
  rightLineY
) => {
  const ctx = document.getElementById(canvasId).getContext("2d");
  const allKeys = [...Object.keys(leftData), ...Object.keys(rightData)];
  const allValues = [...Object.values(leftData), ...Object.values(rightData)];
  const colors = [
    ...Array(Object.keys(leftData).length).fill(leftColor),
    ...Array(Object.keys(rightData).length).fill(rightColor),
  ];

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: allKeys,
      datasets: [
        { label: "Privacy Loss", data: allValues, backgroundColor: colors },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        annotation: {
          annotations: {
            line1: {
              type: "line",
              yMin: leftLineY,
              yMax: leftLineY,
              borderColor: leftColor,
              borderWidth: 2,
            },
            line2: {
              type: "line",
              yMin: rightLineY,
              yMax: rightLineY,
              borderColor: rightColor,
              borderWidth: 2,
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: Math.max(leftLineY, rightLineY),
          title: { display: true, text: "Privacy Loss" },
        },
        x: { title: { display: true, text: xAxisTitle } },
      },
    },
  });
};
