import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

function CoinChart({ coinId, dark }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`
        );
        const data = await response.json();

        if (data && data.prices) {
          setChartData(data.prices);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    if (coinId) {
      fetchChartData();
    }
  }, [coinId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500"></div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        <p>No chart data available</p>
      </div>
    );
  }

  const labels = chartData.map(item =>
    new Date(item[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );

  const prices = chartData.map(item => item[1]);

  // Calculate if trend is positive
  const isPositive = prices[prices.length - 1] >= prices[0];

  const data = {
    labels,
    datasets: [
      {
        label: "Price (USD)",
        data: prices,
        borderColor: isPositive ? "#6366f1" : "#ef4444",
        backgroundColor: isPositive 
          ? "rgba(99, 102, 241, 0.1)" 
          : "rgba(239, 68, 68, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: isPositive ? "#6366f1" : "#ef4444",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        hoverBackgroundColor: isPositive ? "rgba(99, 102, 241, 0.8)" : "rgba(239, 68, 68, 0.8)"
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: dark ? "#e0e7ff" : "#333",
          font: {
            size: 12,
            weight: "600"
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: dark ? "rgba(30, 41, 59, 0.9)" : "rgba(255, 255, 255, 0.9)",
        titleColor: dark ? "#e0e7ff" : "#333",
        bodyColor: dark ? "#cbd5e1" : "#666",
        borderColor: isPositive ? "#6366f1" : "#ef4444",
        borderWidth: 2,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `$${Number(context.parsed.y).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: dark ? "rgba(148, 163, 184, 0.1)" : "rgba(0, 0, 0, 0.1)",
          drawBorder: false
        },
        ticks: {
          color: dark ? "#94a3b8" : "#666",
          font: {
            size: 11
          },
          callback: function(value) {
            return "$" + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: dark ? "#94a3b8" : "#666",
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-full">
      <Line data={data} options={options} />
    </div>
  );
}

export default CoinChart;
