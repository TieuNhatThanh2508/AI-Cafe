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
  let type = random(10);
  if (type < 6) {
    defectCounts.greenObject++;
    // Cập nhật dữ liệu theo thời gian
    const now = new Date();
    timeSeriesData.hour[now.getMinutes()].green++;
    timeSeriesData.day[now.getHours()].green++;
    timeSeriesData.week[now.getDay()].green++;
    timeSeriesData.month[now.getDate() - 1].green++;
    timeSeriesData.year[now.getMonth()].green++;
  } else if (type < 8) {
    let defectCategory = ["worm", "crack", "black"][random(3)];
    defectCounts[defectCategory]++;
    // Cập nhật dữ liệu theo thời gian
    const now = new Date();
    timeSeriesData.hour[now.getMinutes()].defected++;
    timeSeriesData.day[now.getHours()].defected++;
    timeSeriesData.week[now.getDay()].defected++;
    timeSeriesData.month[now.getDate() - 1].defected++;
    timeSeriesData.year[now.getMonth()].defected++;

    if (defectCategory === "worm") {
      timeSeriesData.hour[now.getMinutes()].worm++;
      timeSeriesData.day[now.getHours()].worm++;
      timeSeriesData.week[now.getDay()].worm++;
      timeSeriesData.month[now.getDate() - 1].worm++;
      timeSeriesData.year[now.getMonth()].worm++;
    } else if (defectCategory === "crack") {
      timeSeriesData.hour[now.getMinutes()].crack++;
      timeSeriesData.day[now.getHours()].crack++;
      timeSeriesData.week[now.getDay()].crack++;
      timeSeriesData.month[now.getDate() - 1].crack++;
      timeSeriesData.year[now.getMonth()].crack++;
    } else {
      timeSeriesData.hour[now.getMinutes()].black++;
      timeSeriesData.day[now.getHours()].black++;
      timeSeriesData.week[now.getDay()].black++;
      timeSeriesData.month[now.getDate() - 1].black++;
      timeSeriesData.year[now.getMonth()].black++;
    }
  } else {
    defectCounts.foreignObject++;
    // Cập nhật dữ liệu theo thời gian
    const now = new Date();
    timeSeriesData.hour[now.getMinutes()].foreign++;
    timeSeriesData.day[now.getHours()].foreign++;
    timeSeriesData.week[now.getDay()].foreign++;
    timeSeriesData.month[now.getDate() - 1].foreign++;
    timeSeriesData.year[now.getMonth()].foreign++;
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

function exportReport(type) {
  calculateCategoryTotals();
  const data = [
    ["Danh Mục", "Số lượng"],
    ["Hạt Xanh", defectCounts.greenObject],
    ["Hạt Hư", defectCounts.defected],
    ["Dị vật", defectCounts.foreignObject],
    ["Chi Tiết Bệnh", " "],
    ["Bị Sâu", defectCounts.worm],
    ["Bị Bể", defectCounts.crack],
    ["Bị Đen", defectCounts.black],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Báo Cáo");
  XLSX.writeFile(wb, `Báo cáo phân loại hạt ${type}.xlsx`);
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
