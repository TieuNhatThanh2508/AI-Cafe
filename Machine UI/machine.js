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

// Thêm biến để lưu trữ dữ liệu theo thời gian
let timeSeriesData = {
  hour: Array(60)
    .fill()
    .map(() => ({
      green: 0,
      defected: 0,
      foreign: 0,
      worm: 0,
      crack: 0,
      black: 0,
    })),
  day: Array(24)
    .fill()
    .map(() => ({
      green: 0,
      defected: 0,
      foreign: 0,
      worm: 0,
      crack: 0,
      black: 0,
    })),
  week: Array(7)
    .fill()
    .map(() => ({
      green: 0,
      defected: 0,
      foreign: 0,
      worm: 0,
      crack: 0,
      black: 0,
    })),
  month: Array(31)
    .fill()
    .map(() => ({
      green: 0,
      defected: 0,
      foreign: 0,
      worm: 0,
      crack: 0,
      black: 0,
    })),
  year: Array(12)
    .fill()
    .map(() => ({
      green: 0,
      defected: 0,
      foreign: 0,
      worm: 0,
      crack: 0,
      black: 0,
    })),
};

calculateCategoryTotals();

// Thêm biến để lưu trữ chart configuration
let chartConfig = {
  type: "overview",
  timeScale: "hourly",
};

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

function updateTrackingData(classifiedList) {
  if (!machineRunning || !classifiedList || !classifiedList.length) return;

  const dateTimeStr = getCurrentDateTimeString();

  for (const label of classifiedList) {
    trackingData.lastNumber++;

    let status1 = label;
    if (["Sâu", "Bể", "Đen"].includes(label)) status1 = "Hư";

    trackingData.tracking1[`${dateTimeStr}_${trackingData.lastNumber}`] = {
      "No.": trackingData.lastNumber,
      status: status1,
    };

    trackingData.tracking2[`${dateTimeStr}_${trackingData.lastNumber}`] = {
      "No.": trackingData.lastNumber,
      status: label,
    };
  }
}

function startMachine() {
  if (machineRunning) return;
  machineRunning = true;
  updateStatus("green", "Đang hoạt động");
  runSortingProcess();
  startChartUpdate();
  // Reset tracking data and time series data when starting
  trackingData = {
    tracking1: {},
    tracking2: {},
    lastNumber: 0,
  };
  timeSeriesData = {
    hour: Array(60)
      .fill()
      .map(() => ({
        green: 0,
        defected: 0,
        foreign: 0,
        worm: 0,
        crack: 0,
        black: 0,
      })),
    day: Array(24)
      .fill()
      .map(() => ({
        green: 0,
        defected: 0,
        foreign: 0,
        worm: 0,
        crack: 0,
        black: 0,
      })),
    week: Array(7)
      .fill()
      .map(() => ({
        green: 0,
        defected: 0,
        foreign: 0,
        worm: 0,
        crack: 0,
        black: 0,
      })),
    month: Array(31)
      .fill()
      .map(() => ({
        green: 0,
        defected: 0,
        foreign: 0,
        worm: 0,
        crack: 0,
        black: 0,
      })),
    year: Array(12)
      .fill()
      .map(() => ({
        green: 0,
        defected: 0,
        foreign: 0,
        worm: 0,
        crack: 0,
        black: 0,
      })),
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
  const now = new Date();
  const newClasses = [];

  let type = random(10);
  if (type < 6) {
    defectCounts.greenObject++;
    newClasses.push("Xanh");

    timeSeriesData.hour[now.getMinutes()].green++;
    timeSeriesData.day[now.getHours()].green++;
    timeSeriesData.week[now.getDay()].green++;
    timeSeriesData.month[now.getDate() - 1].green++;
    timeSeriesData.year[now.getMonth()].green++;
  } else if (type < 8) {
    let defectCategory = ["worm", "crack", "black"][random(3)];
    defectCounts[defectCategory]++;
    defectCounts.defected =
      defectCounts.worm + defectCounts.crack + defectCounts.black;

    const labelMap = {
      worm: "Sâu",
      crack: "Bể",
      black: "Đen",
    };
    newClasses.push(labelMap[defectCategory]);

    timeSeriesData.hour[now.getMinutes()].defected++;
    timeSeriesData.day[now.getHours()].defected++;
    timeSeriesData.week[now.getDay()].defected++;
    timeSeriesData.month[now.getDate() - 1].defected++;
    timeSeriesData.year[now.getMonth()].defected++;

    timeSeriesData.hour[now.getMinutes()][defectCategory]++;
    timeSeriesData.day[now.getHours()][defectCategory]++;
    timeSeriesData.week[now.getDay()][defectCategory]++;
    timeSeriesData.month[now.getDate() - 1][defectCategory]++;
    timeSeriesData.year[now.getMonth()][defectCategory]++;
  } else {
    defectCounts.foreignObject++;
    newClasses.push("Dị Vật");

    timeSeriesData.hour[now.getMinutes()].foreign++;
    timeSeriesData.day[now.getHours()].foreign++;
    timeSeriesData.week[now.getDay()].foreign++;
    timeSeriesData.month[now.getDate() - 1].foreign++;
    timeSeriesData.year[now.getMonth()].foreign++;
  }

  calculateCategoryTotals();
  updateCounts();
  updateTrackingData(newClasses); // << pass data here
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
  // Cập nhật ngay lập tức khi thay đổi loại biểu đồ
  document.getElementById("chartType").addEventListener("change", () => {
    if (machineRunning) updateChartData();
  });

  // Cập nhật tần suất khi thay đổi thang thời gian
  let updateFrequency = 1000; // Mặc định cập nhật mỗi giây
  document.getElementById("timeScale").addEventListener("change", (event) => {
    let value = event.target.value;
    if (value === "hourly") updateFrequency = 3600000;
    else if (value === "tenMinutes") updateFrequency = 600000;
    else updateFrequency = 1000; // Cập nhật mỗi giây

    // Khởi động lại interval với tần suất mới
    if (chartUpdateInterval) {
      clearInterval(chartUpdateInterval);
    }
    chartUpdateInterval = setInterval(() => {
      if (machineRunning) updateChartData();
    }, updateFrequency);
  });

  // Bắt đầu cập nhật theo thời gian thực
  chartUpdateInterval = setInterval(() => {
    if (machineRunning) updateChartData();
  }, updateFrequency);
}

function updateChartData() {
  const type = document.getElementById("chartType").value;
  const timeScale = document.getElementById("timeScale").value;

  // Reset chart data
  sortingChart.data.labels = [];
  sortingChart.data.datasets.forEach((dataset) => {
    dataset.data = [];
  });

  // Tạo labels cho trục X dựa trên thang thời gian
  const timeLabels = [];
  const now = new Date();

  switch (timeScale) {
    case "hour":
      // 60 phút trong 1 giờ
      for (let i = 0; i < 60; i++) {
        timeLabels.push(`${i.toString().padStart(2, "0")}'`);
      }
      break;

    case "day":
      // 24 giờ trong 1 ngày
      for (let i = 0; i < 24; i++) {
        timeLabels.push(`${i.toString().padStart(2, "0")}:00`);
      }
      break;

    case "week":
      // 7 ngày trong 1 tuần
      const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      timeLabels.push(...weekdays);
      break;

    case "month":
      // Số ngày trong tháng hiện tại
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        timeLabels.push(`${i}`);
      }
      break;

    case "year":
      // 12 tháng trong năm
      const months = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
      ];
      timeLabels.push(...months);
      break;
  }

  sortingChart.data.labels = timeLabels;

  // Lấy dữ liệu từ timeSeriesData
  const data = timeSeriesData[timeScale];

  if (type === "overview") {
    // Cập nhật datasets cho tổng quát
    sortingChart.data.datasets[0].data = data.map((d) => d.green);
    sortingChart.data.datasets[1].data = data.map((d) => d.defected);
    sortingChart.data.datasets[2].data = data.map((d) => d.foreign);

    sortingChart.data.datasets[0].label = "Hạt Xanh";
    sortingChart.data.datasets[1].label = "Hạt Hư";
    sortingChart.data.datasets[2].label = "Dị Vật";
  } else {
    // Cập nhật datasets cho chi tiết bệnh
    sortingChart.data.datasets[0].data = data.map((d) => d.worm);
    sortingChart.data.datasets[1].data = data.map((d) => d.crack);
    sortingChart.data.datasets[2].data = data.map((d) => d.black);

    sortingChart.data.datasets[0].label = "Sâu";
    sortingChart.data.datasets[1].label = "Bể";
    sortingChart.data.datasets[2].label = "Đen";
  }

  sortingChart.update();
}
const chartSourceSelect = document.getElementById("chartSource");
const importedExcelInput = document.getElementById("importedExcel");
chartSourceSelect.addEventListener("change", (e) => {
  if (e.target.value === "import") {
    importedExcelInput.style.display = "block";
  } else {
    importedExcelInput.style.display = "none";
    updateChartData();
  }
});

importedExcelInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheetName = workbook.SheetNames[1];
  const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Chuyển jsonData thành dữ liệu biểu đồ đơn giản
  const timestamps = jsonData.map((row) => row.Timestamp);
  const categories = ["Xanh", "Dị Vật", "Sâu", "Bể", "Đen"];
  const datasetMap = {};
  categories.forEach(
    (cat) => (datasetMap[cat] = Array(timestamps.length).fill(0))
  );

  jsonData.forEach((row, idx) => {
    const label = row["Phân loại"];
    if (datasetMap[label] !== undefined) datasetMap[label][idx] = 1;
  });

  sortingChart.data.labels = timestamps;
  sortingChart.data.datasets = categories.map((cat, i) => ({
    label: cat,
    data: datasetMap[cat],
    borderColor: `hsl(${i * 70}, 70%, 60%)`,
    tension: 0.1,
    fill: false,
  }));

  sortingChart.update();
});

function exportReport(type) {
  try {
    const now = new Date();
    const hours = now.getHours();
    const filename = `Báo cáo phân loại hạt daily[${hours}-${hours} ${now.getDate()}/${
      now.getMonth() + 1
    }/${now.getFullYear()}].xlsx`;

    // Tạo summarySheet
    const summarySheet = [
      ["Danh Mục", "Số lượng"],
      ["Hạt Xanh", defectCounts.greenObject || 0],
      ["Hạt Hư", defectCounts.defected || 0],
      ["Dị vật", defectCounts.foreignObject || 0],
      ["Chi Tiết Bệnh", ""],
      ["Bị Sâu", defectCounts.worm || 0],
      ["Bị Bể", defectCounts.crack || 0],
      ["Bị Đen", defectCounts.black || 0],
    ];

    // Tạo detailsSheet
    const detailsSheet = [["STT", "Timestamp", "Phân loại"]];
    for (const [time, info] of Object.entries(trackingData.tracking2 || {})) {
      detailsSheet.push([info["No."] || "", time, info.status || ""]);
    }

    // Tạo workbook và thêm sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(summarySheet),
      "Tổng Quan"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(detailsSheet),
      "Chi Tiết"
    );

    // Xuất file
    XLSX.writeFile(wb, filename);
    console.log(`Báo cáo đã được xuất thành công: ${filename}`);
  } catch (error) {
    console.error("Đã xảy ra lỗi khi xuất báo cáo:", error);
  }
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
  initChart();
});

function initChart() {
  const ctx = document.getElementById("sortingChart").getContext("2d");
  sortingChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Hạt Xanh",
          data: [],
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
          fill: false,
        },
        {
          label: "Hạt Hư",
          data: [],
          borderColor: "rgb(255, 99, 132)",
          tension: 0.1,
          fill: false,
        },
        {
          label: "Dị Vật",
          data: [],
          borderColor: "rgb(255, 159, 64)",
          tension: 0.1,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "white",
            stepSize: 5,
          },
        },
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "white",
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: "white",
          },
        },
      },
    },
  });

  // Khởi tạo sự kiện cho loại biểu đồ và thang thời gian
  document
    .getElementById("chartType")
    .addEventListener("change", updateChartData);
  document
    .getElementById("timeScale")
    .addEventListener("change", updateChartData);

  // Cập nhật biểu đồ lần đầu
  updateChartData();
}

function sortCategories() {
  const sortOption = document.getElementById("sortOption").value;
  const categoryList = document.getElementById("categoryList");
  const mainCategory = categoryList.querySelector("li:first-child");
  const subCategories = Array.from(
    categoryList.querySelectorAll(".sub-category li")
  );

  if (sortOption === "count") {
    // Hide main category when sorting by count
    mainCategory.style.display = "none";

    // Sort subcategories by their count values
    subCategories.sort((a, b) => {
      const countA = parseInt(a.querySelector("span").textContent);
      const countB = parseInt(b.querySelector("span").textContent);
      return countB - countA; // Sort in descending order
    });

    // Move sorted subcategories to the main list
    const subCategoryList = document.createElement("ul");
    subCategoryList.className = "category-list sorted";
    subCategories.forEach((item) => {
      subCategoryList.appendChild(item.cloneNode(true));
    });

    // Replace the old list with the new sorted list
    categoryList.innerHTML = "";
    categoryList.appendChild(subCategoryList);
  } else {
    // Restore default view
    categoryList.innerHTML = `
        <li>Hư (<span id="defected-count">0</span>)
            <ul class="sub-category">
                <li>Sâu (<span id="worm-count">${defectCounts.worm}</span>)</li>
                <li>Bể (<span id="crack-count">${defectCounts.crack}</span>)</li>
                <li>Đen (<span id="black-count">${defectCounts.black}</span>)</li>
            </ul>
        </li>
    `;
    calculateCategoryTotals();
    updateCounts();
  }
}
