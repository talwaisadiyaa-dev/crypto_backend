import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function WatchlistChart({ data, prices }) {

  // 🎯 VALUES
  const values = data.map(item => prices[item.coinId]?.usd || 0);

  // 🎯 TOTAL
  const total = values.reduce((sum, val) => sum + val, 0);

  // 🎯 CHART DATA
  const chartData = {
    labels: data.map(item => item.coinName),

    datasets: [
      {
        label: "Current Value",
        data: values,

        backgroundColor: [
          "#4ade80",
          "#60a5fa",
          "#facc15",
          "#f87171",
          "#a78bfa",
          "#34d399",
          "#fb923c"
        ],

        borderWidth: 0
      }
    ]
  };

  // 🎯 OPTIONS (clean look)
  const options = {
    plugins: {
      legend: {
        position: "bottom"
      }
    },
    cutout: "65%" // 👈 makes it doughnut style
  };

  return (
    <div
      style={{
        width: "320px",
        margin: "30px auto",
        position: "relative"
      }}
    >

      <Doughnut data={chartData} options={options} />

      {/* 🔥 CENTER TEXT */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          fontWeight: "bold"
        }}
      >
        <p style={{ margin: 0, fontSize: "14px" }}>Total</p>
        <p style={{ margin: 0, fontSize: "18px" }}>
          ${total.toFixed(2)}
        </p>
      </div>

    </div>
  );
}

export default WatchlistChart;