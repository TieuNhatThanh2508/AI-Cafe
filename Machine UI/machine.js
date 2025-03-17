let machineRunning = false;
let progress = 0;
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
  if (machineRunning) return;
  machineRunning = true;
  updateStatus("green", "Active");
  runSortingProcess();
  startChartUpdate();
}

function stopMachine() {
  machineRunning = false;
  updateStatus("red", "Stopped");
}

function runSortingProcess() {
  if (!machineRunning) return;
  progress = 0;
  let interval = setInterval(() => {
    progress += 10;
    document.getElementById("progressBar").style.width = progress + "%";
    document.getElementById("progressText").innerText = progress + "%";

    if (progress >= 100) {
      clearInterval(interval);
      classifyBean();
      setTimeout(runSortingProcess, 1000);
    }
  }, 100);
}

function classifyBean() {
  let type = random(10);
  if (type < 6) {
    defectCounts.greenObject++;
  } else if (type < 8) {
    let defectCategory = `cateA${random(3) + 1}`;
    defectCounts[defectCategory]++;
  } else if (type < 10) {
    let defectCategory = `cateB${random(3) + 1}`;
    defectCounts[defectCategory]++;
  } else {
    defectCounts.foreignObject++;
  }
  calculateCategoryTotals();
  updateCounts();
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
    defectCounts.cateA1 + defectCounts.cateA2 + defectCounts.cateA3;
  defectCounts.cateB =
    defectCounts.cateB1 + defectCounts.cateB2 + defectCounts.cateB3;
}

function startChartUpdate() {
  let updateFrequency = 60000; // Mặc định cập nhật mỗi phút
  document.getElementById("timeScale").addEventListener("change", (event) => {
    let value = event.target.value;
    if (value === "hourly") updateFrequency = 3600000;
    else if (value === "tenMinutes") updateFrequency = 600000;
    else updateFrequency = 60000;
  });

  setInterval(() => {
    if (machineRunning) updateChartModule();
  }, updateFrequency);
}

function updateChartModule() {
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
  const defectTotal = defectCounts.cateA + defectCounts.cateB;
  const data = [
    ["Categories", "Number", "Sum"],
    ["Green", "", defectCounts.greenObject],
    ["Defected", "", defectTotal],
    ["Defect A", defectCounts.cateA, ""],
    ["", "Defect A1", defectCounts.cateA1],
    ["", "Defect A2", defectCounts.cateA2],
    ["", "Defect A3", defectCounts.cateA3],
    ["Defect B", defectCounts.cateB, ""],
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

function resetValues() {
  Object.keys(defectCounts).forEach((key) => (defectCounts[key] = 0));
  updateCounts();
}
resetValues();
