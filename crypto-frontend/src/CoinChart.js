import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function CoinChart({ coinId, dark }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`)
      .then(res => res.json())
      .then(data => {
        if (data && data.prices) {
          setChartData(data.prices);
        } else {
          setChartData([]);
        }
      });
  }, [coinId]);

  const labels = chartData.map(item =>
    new Date(item[0]).toLocaleDateString()
  );

  const prices = chartData.map(item => item[1]);

  const data = {
    labels,
    datasets: [
      {
        label: "Price",
        data: prices,
        borderColor: dark ? "#00ffcc" : "#000",
        borderWidth: 2
      }
    ]
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: dark ? "white" : "black"
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: dark ? "white" : "black"
        }
      },
      y: {
        ticks: {
          color: dark ? "white" : "black"
        }
      }
    }
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>📊 7 Day Price Chart</h3>

      {chartData.length > 0 ? (
        <Line data={data} options={options} />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
}

export default CoinChart;