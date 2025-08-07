import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { api } from '../../services/api';

// Cache untuk chart data
const getCachedChartData = () => {
  try {
    const cached = localStorage.getItem('chartData');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Silent error handling
  }

  // Default chart data
  return {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    datasets: [
      {
        label: 'Pengunjung Website',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.4,
      },
      {
        label: 'Login Admin',
        data: [28, 48, 40, 19, 86, 27, 90],
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgb(16, 185, 129)',
        tension: 0.4,
      }
    ]
  };
};

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatisticsChart = () => {
  const [chartData, setChartData] = useState(getCachedChartData()); // Initialize with cached data
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(7); // Default 7 days
  // Remove loading and refreshing states - always show chart immediately

  const fetchChartData = async (days = timeRange) => {
    try {
      setError(null);

      const response = await api.get(`/dashboard/chart-data?days=${days}`);

      if (response.data.success) {
        const newData = response.data.data;
        setChartData(newData);

        // Cache the new data
        try {
          localStorage.setItem('chartData', JSON.stringify(newData));
        } catch {
          // Silent error if localStorage is full
        }
      } else {
        setError('Gagal mengambil data chart');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
      // Keep cached data, don't overwrite
    }
    // Remove finally block - no loading states to reset
  };

  const handleRefresh = async () => {
    await fetchChartData();
    // Remove refreshing state - instant refresh
  };

  const handleTimeRangeChange = (days) => {
    setTimeRange(days);
    fetchChartData(days);
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      title: {
        display: true,
        text: `Statistik ${timeRange} Hari Terakhir`,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          stepSize: 1
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        hoverBorderWidth: 3
      },
      line: {
        borderWidth: 3,
        tension: 0.4
      }
    }
  };

  // Remove loading state - always show chart immediately

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl font-bold text-gray-900">Grafik Statistik</h2>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Time range selector */}
          <div className="flex space-x-2">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => handleTimeRangeChange(days)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  timeRange === days
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {days} Hari
              </button>
            ))}
          </div>
          
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative" style={{ height: '400px' }}>
        {chartData && (
          <Line 
            data={chartData} 
            options={chartOptions}
          />
        )}
      </div>

      {/* Legend info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Pengunjung harian website</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Berita yang dipublikasi</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Gallery yang ditambahkan</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsChart;
