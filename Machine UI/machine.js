let green = 0,
  black = 0,
  sour = 0,
  broken = 0,
  scorched = 0;
let running = false;
let intervalId;
let stopClickedOnce = false;
let stopClickTimer;
let isPrepConfirmed = false;
let totalBeans = 0;
let hasReported = false;

const MAX_BEANS = 1500;
const greenCountEl = document.getElementById("greenCount");
const blackCountEl = document.getElementById("blackCount");
const sourCountEl = document.getElementById("sourCount");
const brokenCountEl = document.getElementById("brokenCount");
const scorchedCountEl = document.getElementById("scorchedCount");

const ctx = document.getElementById("pieChartClassification").getContext("2d");
const chart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: ["Hạt Xanh", "Hạt Đen", "Hạt Chua", "Hạt Bể", "Hạt Sém"],
    datasets: [
      {
        data: [0, 0, 0, 0, 0],
        backgroundColor: ["#00ff00", "gray", "#ffff00", "#800080", "#ffa500"],
      },
    ],
  },
  options: {
    layout: {
      padding: 0,
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: "center",
        align: "center",
        offset: 10,
        color: "#fff",
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce(
            (a, b) => a + b,
            0
          );
          return total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "";
        },
        font: {
          weight: "bold",
          size: 13,
        },
        color: function (context) {
          // ✅ 2. Đổi màu chữ nếu nền là vàng
          const index = context.dataIndex;
          const bg = context.chart.data.datasets[0].backgroundColor[index];

          // YIQ contrast formula
          const hex = bg.replace("#", "");
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          const yiq = (r * 299 + g * 587 + b * 114) / 1000;

          return yiq >= 128 ? "#000" : "#fff";
        },
      },
    },
  },
  plugins: [ChartDataLabels],
});

function updateUI() {
  // Cập nhật biểu đồ
  chart.data.datasets[0].data = [green, black, sour, broken, scorched];
  chart.update();

  // Cập nhật số liệu lên HTML nếu có
  document.getElementById("greenCount").textContent = green;
  document.getElementById("blackCount").textContent = black;
  document.getElementById("sourCount").textContent = sour;
  document.getElementById("brokenCount").textContent = broken;
  document.getElementById("scorchedCount").textContent = scorched;

  // Cập nhật tổng
  const total = green + black + sour + broken + scorched;
  document.getElementById("totalCount").textContent = total;
}

function generateRandomBean() {
  const rand = Math.random();
  if (rand < 0.2) green++;
  else if (rand < 0.4) black++;
  else if (rand < 0.6) sour++;
  else if (rand < 0.8) broken++;
  else scorched++;

  updateUI();

  const total = green + black + sour + broken + scorched;
  if (total >= MAX_BEANS && !hasReported && running) {
    hasReported = true;
    clearInterval(intervalId);
    running = false;
    updateStatusIndicator(false);
    showResultModal();
  }
}

function startMachine() {
  if (!isPrepConfirmed) {
    showPrepModal();
    return;
  }

  if (running) return;

  running = true;
  intervalId = setInterval(generateRandomBean, 10);
  updateStatusIndicator(true);
}

function stopMachine() {
  if (!running) {
    if (stopClickedOnce) {
      resetAll();
      stopClickedOnce = false;
      clearTimeout(stopClickTimer);
      return;
    }

    stopClickedOnce = true;
    stopClickTimer = setTimeout(() => {
      stopClickedOnce = false;
    }, 2000);

    return;
  }

  running = false;
  clearInterval(intervalId);
  updateStatusIndicator(false);
}

function exportReport(type) {
  const total = green + black + sour + broken + scorched;
  const report =
    `Hạt Xanh: ${green}\n` +
    `Hạt Đen: ${black}\n` +
    `Hạt Chua: ${sour}\n` +
    `Hạt Bể: ${broken}\n` +
    `Hạt Sém: ${scorched}\n` +
    `Tổng số hạt: ${total}`;

  alert("Báo cáo:\n" + report);
}

function resetAll() {
  green = black = sour = broken = scorched = 0;
  isPrepConfirmed = false;
  running = false;
  hasReported = false;
  clearInterval(intervalId);

  updateUI();
  updateStatusIndicator(false);

  document.getElementById("reportModal").classList.remove("show");
  document.getElementById("cameraModule").style.display = "block";
  document.getElementById("prepModal").classList.remove("show");
}

function updateStatusIndicator(isRunning) {
  const status = document.getElementById("machineStatus");
  const color = isRunning ? "lime" : "red";
  const text = isRunning ? "Đang hoạt động" : "Đang dừng";

  status.innerHTML = `<span class="status-dot" style="background-color: ${color};"></span> ${text}`;
}

function showPrepModal() {
  document.getElementById("prepModal").classList.add("show");
}

function confirmPrep() {
  document.getElementById("prepModal").classList.remove("show");
  isPrepConfirmed = true;
  startMachine();
}

function cancelPrep() {
  document.getElementById("prepModal").classList.remove("show");
}

function showResultModal() {
  updateUI();
  document.getElementById("cameraModule").style.display = "none";
  document.getElementById("reportModal").classList.add("show");
  const [defectScore, quality] = coffee_evaluation_result();

  document.getElementById(
    "defectScoreText"
  ).textContent = `Điểm lỗi: ${defectScore}`;
  const iconMap = {
    Specialty: "🟢",
    Premium: "🟢",
    Exchange: "🟡",
    Substandard: "🔴",
    Off: "🔴",
  };

  const icon = iconMap[quality] || "❓";
  document.getElementById(
    "qualityGradeText"
  ).textContent = `Phân loại: ${quality} ${icon} Grade`;

  const qualityAdvice = {
    Specialty: {
      description:
        "Exemplary coffee with no primary defects and minimal secondary defects. Scores ≤ 5.",
      improvement:
        "Maintain selective picking, precise processing, and storage.",
    },
    Premium: {
      description: "High-quality coffee with minor defects. Scores ≤ 8.",
      improvement: "Enhance harvesting, processing, and consistency control.",
    },
    Exchange: {
      description: "Average coffee with moderate defects. Scores 9–23.",
      improvement: "Focus on reducing defects during processing.",
    },
    Substandard: {
      description:
        "Below average coffee with significant defects. Scores 24–86.",
      improvement: "Improve harvesting and processing quality.",
    },
    Off: {
      description: "Unacceptable coffee quality. Scores > 86.",
      improvement: "Overhaul all steps from farm to storage.",
    },
  };

  const tips = qualityAdvice[quality] || {
    description: "--",
    improvement: "--",
  };
  document.getElementById("qualityDescription").textContent =
    "Mô tả: " + tips.description;
  document.getElementById("qualityImprovement").textContent =
    "Gợi ý cải thiện: " + tips.improvement;
}

window.onload = function () {
  // Reset lại tất cả modal khi load trang
  document.getElementById("prepModal").classList.remove("show");
  document.getElementById("reportModal").classList.remove("show");

  // Đảm bảo module hiển thị đúng
  document.getElementById("cameraModule").style.display = "block";

  // Reset trạng thái chính xác
  green = black = sour = broken = scorched = 0;
  hasReported = false;
  isPrepConfirmed = false;
  running = false;
  clearInterval(intervalId);
  updateUI();
  updateStatusIndicator(false);
};

function coffee_evaluation_result() {
  const green = parseInt(document.getElementById("greenCount").textContent);
  const black = parseInt(document.getElementById("blackCount").textContent);
  const sour = parseInt(document.getElementById("sourCount").textContent);
  const broken = parseInt(document.getElementById("brokenCount").textContent);
  const scorched = parseInt(
    document.getElementById("scorchedCount").textContent
  );

  // Cân nặng điểm lỗi: giả sử
  const defectScore = black * 5 + sour * 4 + broken * 3 + scorched * 2;

  let quality = "Off";
  if (defectScore <= 5) quality = "Specialty";
  else if (defectScore <= 8) quality = "Premium";
  else if (defectScore <= 23) quality = "Exchange";
  else if (defectScore <= 86) quality = "Substandard";
  else quality = "Off";

  return [defectScore, quality];
}
