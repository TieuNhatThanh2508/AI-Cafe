let machineRunning = false;
let progress = 0;
let sortingChart;

// Đồng bộ defectCounts với các phần tử HTML
let defectCounts = {
  greenObject: 0,
  defected: 0,
  worm: 0,
  crack: 0,
  black: 0,
  foreignObject: 0,
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
  updateStatus("green", "Đang hoạt động");
  runSortingProcess();
  startChartUpdate();
}

function stopMachine() {
  machineRunning = false;
  updateStatus("red", "Đã dừng");
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
    let defectCategory = ["worm", "crack", "black"][random(3)];
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

  // Cập nhật các giá trị tổng hợp
  document.getElementById("greenCount").innerText = defectCounts.greenObject;
  document.getElementById("defectedCount").innerText =
    defectCounts.worm + defectCounts.crack + defectCounts.black;
  document.getElementById("foreignCount").innerText =
    defectCounts.foreignObject;
}

function calculateCategoryTotals() {
  defectCounts.defected =
    defectCounts.worm + defectCounts.crack + defectCounts.black;
}

function startChartUpdate() {
  let updateFrequency = 60000;
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
  sortingChart.data.datasets[1].data.push(defectCounts.defected);
  sortingChart.data.datasets[2].data.push(defectCounts.foreignObject);
  sortingChart.update();
}

function exportReport(type) {
  calculateCategoryTotals();
  const data = [
    ["Categories", "Number"],
    ["Green", defectCounts.greenObject],
    ["Defected", defectCounts.defected],
    ["Worm", defectCounts.worm],
    ["Crack", defectCounts.crack],
    ["Black", defectCounts.black],
    ["Foreign Object", defectCounts.foreignObject],
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
