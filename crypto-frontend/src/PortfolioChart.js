import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function PortfolioChart({ data, prices }) {
  const chartData = {
    labels: data.map(item => item.coinName),  // Example: coin names as x-axis
    datasets: [
      {
        label: 'Portfolio Value',
        data: data.map(item => prices[item.coinId]?.usd || 0),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  return <Line data={chartData} />;
}

export default PortfolioChart;