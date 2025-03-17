let machineRunning = false;
let progress = 0;
let sortingChart;
let trackingData = {
  tracking1: {},
  tracking2: {},
  lastNumber: 0,
};

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

function getCurrentDateString() {
  const now = new Date();
  return `${now.getFullYear().toString().slice(-2)}/${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${now.getDate().toString().padStart(2, "0")}`;
}

function getCurrentDateTimeString() {
  const now = new Date();
  return `${now.getFullYear().toString().slice(-2)}/${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${now.getDate().toString().padStart(2, "0")}/${now
    .getHours()
    .toString()
    .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;
}

function saveTrackingData() {
  const dateStr = getCurrentDateString();

  // Save tracking1 data
  const tracking1Blob = new Blob(
    [JSON.stringify(trackingData.tracking1, null, 2)],
    {
      type: "application/json",
    }
  );
  const tracking1URL = window.URL.createObjectURL(tracking1Blob);
  const tracking1Link = document.createElement("a");
  tracking1Link.href = tracking1URL;
  tracking1Link.download = `tracking1.json_${dateStr}`;
  document.body.appendChild(tracking1Link);
  tracking1Link.click();
  document.body.removeChild(tracking1Link);
  window.URL.revokeObjectURL(tracking1URL);

  // Save tracking2 data
  const tracking2Blob = new Blob(
    [JSON.stringify(trackingData.tracking2, null, 2)],
    {
      type: "application/json",
    }
  );
  const tracking2URL = window.URL.createObjectURL(tracking2Blob);
  const tracking2Link = document.createElement("a");
  tracking2Link.href = tracking2URL;
  tracking2Link.download = `tracking2.json_${dateStr}`;
  document.body.appendChild(tracking2Link);
  tracking2Link.click();
  document.body.removeChild(tracking2Link);
  window.URL.revokeObjectURL(tracking2URL);
}

function updateTrackingData() {
  if (!machineRunning) return;

  // Lưu các giá trị tạm thời để tránh thay đổi trong quá trình xử lý
  const currentGreen = defectCounts.greenObject;
  const currentForeign = defectCounts.foreignObject;
  const currentWorm = defectCounts.worm;
  const currentCrack = defectCounts.crack;
  const currentBlack = defectCounts.black;

  const dateTimeStr = getCurrentDateTimeString();

  // Ghi nhận hạt Xanh
  if (currentGreen > 0) {
    trackingData.lastNumber++;
    trackingData.tracking1[dateTimeStr] = {
      "No.": trackingData.lastNumber,
      status: "Xanh",
    };
  }

  // Ghi nhận hạt Dị Vật
  if (currentForeign > 0) {
    trackingData.lastNumber++;
    trackingData.tracking1[dateTimeStr] = {
      "No.": trackingData.lastNumber,
      status: "Dị Vật",
    };
  }

  // Ghi nhận hạt Sâu (vào cả 2 file)
  if (currentWorm > 0) {
    trackingData.lastNumber++;
    trackingData.tracking1[dateTimeStr] = {
      "No.": trackingData.lastNumber,
      status: "Hư",
    };
    trackingData.tracking2[dateTimeStr] = {
      "No.": trackingData.lastNumber,
      status: "Sâu",
    };
  }

  // Ghi nhận hạt Bể (vào cả 2 file)
  if (currentCrack > 0) {
    trackingData.lastNumber++;
    trackingData.tracking1[dateTimeStr] = {
      "No.": trackingData.lastNumber,
      status: "Hư",
    };
    trackingData.tracking2[dateTimeStr] = {
      "No.": trackingData.lastNumber,
      status: "Bể",
    };
  }

  // Ghi nhận hạt Đen (vào cả 2 file)
  if (currentBlack > 0) {
    trackingData.lastNumber++;
    trackingData.tracking1[dateTimeStr] = {
      "No.": trackingData.lastNumber,
      status: "Hư",
    };
    trackingData.tracking2[dateTimeStr] = {
      "No.": trackingData.lastNumber,
      status: "Đen",
    };
  }
}

function startMachine() {
  if (machineRunning) return;
  machineRunning = true;
  updateStatus("green", "Đang hoạt động");
  runSortingProcess();
  startChartUpdate();
  // Reset tracking data when starting
  trackingData = {
    tracking1: {},
    tracking2: {},
    lastNumber: 0,
  };
}

function stopMachine() {
  machineRunning = false;
  updateStatus("red", "Đã dừng");
  saveTrackingData();
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
  updateTrackingData();
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

document.addEventListener("DOMContentLoaded", () => {
  const currentDateElement = document.getElementById("currentDate");
  if (currentDateElement) {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${today.getFullYear().toString().slice(-2)}`;
    currentDateElement.textContent = `${formattedDate}`;
  }
});
