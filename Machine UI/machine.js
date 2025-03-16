let machineRunning = true;
let progress = 67;
let sortingChart;
let defectCounts = {
  cateA1: 0,
  cateA2: 0,
  cateA3: 0,
  cateB1: 0,
  cateB2: 0,
  cateB3: 0,
  foreignObject: 0,
  greenObject: 0,
};
calculateCategoryTotals();

function random(max) {
  return Math.floor(Math.random() * max);
}

function updateStatus(color, text) {
  document.getElementById("statusIndicator").style.background = color;
  document.getElementById("statusText").innerText = text;
}

function startMachine() {
  machineRunning = true;
  updateStatus("green", "Active");
}

function stopMachine() {
  machineRunning = false;
  updateStatus("red", "Stopped");
}

function monitorMachine() {
  if (machineRunning && progress < 20) {
    updateStatus("yellow", "Error");
  }
}
setInterval(monitorMachine, 3000);

document.getElementById("currentDate").innerText =
  new Date().toLocaleDateString();
updateCounts();

document
  .getElementById("timeScale")
  .addEventListener("change", (e) => updateChart(e.target.value));
updateChart("hourly");

function generateData(scale) {
  const maxRange = { hourly: 24, daily: 30, weekly: 7, monthly: 12, yearly: 5 }[
    scale
  ];
  return {
    labels: Array.from({ length: maxRange }, (_, i) => i + 1),
    greenData: Array(maxRange).fill(0),
    defectedData: Array(maxRange).fill(0),
    foreignData: Array(maxRange).fill(0),
  };
}

function updateChart(scale) {
  const data = generateData(scale);
  if (sortingChart) sortingChart.destroy();

  sortingChart = new Chart(
    document.getElementById("sortingChart").getContext("2d"),
    {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Green",
            data: data.greenData,
            borderColor: "cyan",
            borderWidth: 2,
          },
          {
            label: "Defected",
            data: data.defectedData,
            borderColor: "red",
            borderWidth: 2,
          },
          {
            label: "Foreign Object",
            data: data.foreignData,
            borderColor: "yellow",
            borderWidth: 2,
          },
        ],
      },
      options: { responsive: true },
    }
  );
}

function updateChartModule() {
  calculateCategoryTotals();
  sortingChart.data.labels.push(new Date().toLocaleTimeString());
  sortingChart.data.datasets[0].data.push(defectCounts.greenObject);
  sortingChart.data.datasets[1].data.push(
    defectCounts.cateA + defectCounts.cateB
  );
  sortingChart.data.datasets[2].data.push(defectCounts.foreignObject);
  sortingChart.update();
}

function exportReport(type) {
  calculateCategoryTotals();
  const defectA =
    defectCounts.cateA1 + defectCounts.cateA2 + defectCounts.cateA3;
  const defectB =
    defectCounts.cateB1 + defectCounts.cateB2 + defectCounts.cateB3;
  const defectTotal = defectA + defectB;

  const data = [
    ["Categories", "Number", "Sum"],
    ["Green", "", defectCounts.greenObject],
    ["Defected", "", defectTotal],
    ["Defect A", defectA, ""],
    ["", "Defect A1", defectCounts.cateA1],
    ["", "Defect A2", defectCounts.cateA2],
    ["", "Defect A3", defectCounts.cateA3],
    ["Defect B", defectB, ""],
    ["", "Defect B1", defectCounts.cateB1],
    ["", "Defect B2", defectCounts.cateB2],
    ["", "Defect B3", defectCounts.cateB3],
    ["Foreign Object", defectCounts.foreignObject, ""],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `sorting_report_${type}.xlsx`);
}

function updateCounts() {
  Object.keys(defectCounts).forEach((key) => {
    const element = document.getElementById(`${key}-count`);
    if (element) element.innerText = defectCounts[key];
  });
  document.getElementById("greenCount").innerText = defectCounts.greenObject;
  document.getElementById("defectedCount").innerText =
    defectCounts.cateA + defectCounts.cateB;
  document.getElementById("foreignCount").innerText =
    defectCounts.foreignObject;
}

function calculateCategoryTotals() {
  defectCounts.cateA =
    (defectCounts.cateA1 || 0) +
    (defectCounts.cateA2 || 0) +
    (defectCounts.cateA3 || 0);
  defectCounts.cateB =
    (defectCounts.cateB1 || 0) +
    (defectCounts.cateB2 || 0) +
    (defectCounts.cateB3 || 0);
}

function updateRandomCategory() {
  const categories = Object.keys(defectCounts);
  const randomCategory = categories[random(categories.length)];
  defectCounts[randomCategory] += 1;
  calculateCategoryTotals();
  updateCounts();
}

setInterval(updateRandomCategory, 1000);
setInterval(updateChartModule, 10000);

function resetValues() {
  Object.keys(defectCounts).forEach((key) => (defectCounts[key] = 0));
  updateCounts();
  updateChartModule();
}
resetValues();
