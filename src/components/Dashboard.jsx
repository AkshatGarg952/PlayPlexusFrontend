import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import styles from '../css/Dashbaord.module.css';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);


const Stat = ({ number, label }) => (
  <div className={styles.stat}>
    <span className={styles.number}>{number}</span>
    <span className={styles.label}>{label}</span>
  </div>
);


const DashboardCard = ({ title, stats, chartId, chartData, chartOptions, legendItems, isFullScreen }) => {
  const chartRef = React.useRef(null);
  useEffect(() => {
    const chartInstance = chartRef.current;
    if (chartInstance) {
      chartInstance.data = chartData;
      chartInstance.options = chartOptions;
      chartInstance.update();
    }
  }, [chartData, chartOptions]);

  return (
    <div className={`${styles.dashboardCard} ${isFullScreen ? styles.fullScreen : ''}`}>
      <h2>{title}</h2>
      <div className={styles.statsRow}>
        {stats.map((stat, index) => (
          <Stat key={index} number={stat.number} label={stat.label} />
        ))}
      </div>
      {legendItems && (
        <div className={styles.legend}>
          {legendItems.map((item, index) => (
            <span key={index} className={styles.legendItem}>
              <span className={`${styles.colorBox} ${styles[item.colorClass]}`}></span> {item.label}
            </span>
          ))}
        </div>
      )}
      <div className={styles.chartCanvasContainer}> {/* Wrapper for canvas */}
        <Bar ref={chartRef} data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};


function DashboardMain({ user, team }) {
  const token = localStorage.getItem('token');
  const [activeGraph, setActiveGraph] = useState('sent'); // 'sent', 'received', 'both'
  const [sentData, setSentData] = useState({
    totalCount: 0, accepted: 0, rejected: 0, pending: 0, expired: 0, cancelled: 0
  });
  const [receivedData, setReceivedData] = useState({
    totalCount: 0, accepted: 0, rejected: 0, noAction: 0, expired: 0, cancelled: 0
  });

  const id = user?._id || team?._id;

  // Fetch data on component mount or when user/team ID changes
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
       const [sentResponse, receivedResponse] = await Promise.all([
  fetch(`https://playplexusbackend.onrender.com/api/requests/sender/${id}`, {
    method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }
  }),
  fetch(`https://playplexusbackend.onrender.com/api/requests/receiver/${id}`, {
    method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }
  })
]);


        if (!sentResponse.ok) throw new Error('Failed to fetch sent requests');
        if (!receivedResponse.ok) throw new Error('Failed to fetch received requests');

        const sentJson = await sentResponse.json();
        const receivedJson = await receivedResponse.json();

        setSentData({
          totalCount: sentJson.total || 0,
          accepted: sentJson.statusWise.find(item => item._id === "accepted")?.count || 0,
          rejected: sentJson.statusWise.find(item => item._id === "rejected")?.count || 0,
          expired: sentJson.statusWise.find(item => item._id === "expired")?.count || 0,
          cancelled: sentJson.statusWise.find(item => item._id === "cancelled")?.count || 0,
          pending: sentJson.statusWise.find(item => item._id === "pending")?.count || 0,
        });

        setReceivedData({
          totalCount: receivedJson.total || 0,
          accepted: receivedJson.statusWise.find(item => item._id === "accepted")?.count || 0,
          rejected: receivedJson.statusWise.find(item => item._id === "rejected")?.count || 0,
          expired: receivedJson.statusWise.find(item => item._id === "expired")?.count || 0,
          noAction: receivedJson.statusWise.find(item => item._id === "pending")?.count || 0,
          cancelled: receivedJson.statusWise.find(item => item._id === "cancelled")?.count || 0,
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        alert(err.message);
      }
    };

    fetchData();
  }, [id]); // Re-fetch when user/team ID changes

  // Chart data and options
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Important for controlling height via CSS
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#fff', font: { size: 14 }, stepSize: 1, precision: 0 },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: '#fff', font: { size: 14 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y || 0;
            const label = context.dataset.label || '';
            return `${label}: ${value}`;
          }
        }
      },
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  const sentChartData = {
    labels: ['Total', 'Accepted', 'Rejected', 'Pending', 'Cancelled', 'Expired'],
    datasets: [{
      label: 'Requests You Sent',
      data: [sentData.totalCount, sentData.accepted, sentData.rejected, sentData.pending, sentData.cancelled, sentData.expired],
      backgroundColor: '#7c4dff',
      hoverBackgroundColor: '#5e35b1',
    }]
  };

  const receivedChartData = {
    labels: ['Total', 'Accepted', 'Rejected', 'No Action', 'Cancelled', 'Expired'],
    datasets: [{
      label: 'Requests You Received',
      data: [receivedData.totalCount, receivedData.accepted, receivedData.rejected, receivedData.noAction, receivedData.cancelled, receivedData.expired],
      backgroundColor: '#ff5c8d',
      hoverBackgroundColor: '#d81b60',
    }]
  };

  const bothChartData = {
    labels: ['Total', 'Accepted', 'Rejected', 'No Action/Pending', 'Cancelled', 'Expired'],
    datasets: [
      {
        label: 'Requests You Sent',
        data: [sentData.totalCount, sentData.accepted, sentData.rejected, sentData.pending, sentData.cancelled, sentData.expired],
        backgroundColor: '#7c4dff',
        hoverBackgroundColor: '#5e35b1',
      },
      {
        label: 'Requests You Received',
        data: [receivedData.totalCount, receivedData.accepted, receivedData.rejected, receivedData.noAction, receivedData.cancelled, receivedData.expired],
        backgroundColor: '#ff5c8d',
        hoverBackgroundColor: '#d81b60',
      }
    ]
  };

  // Stats for display in cards
  const sentStats = [
    { number: sentData.totalCount, label: 'Total Sent' },
    { number: sentData.accepted, label: 'Accepted by Others' },
    { number: sentData.rejected, label: 'Rejected by Others' },
    { number: sentData.pending, label: 'Pending' },
    { number: sentData.cancelled, label: 'Cancelled by You' },
    { number: sentData.expired, label: 'Expired' },
  ];

  const receivedStats = [
    { number: receivedData.totalCount, label: 'Total Received' },
    { number: receivedData.accepted, label: 'Accepted by You' },
    { number: receivedData.rejected, label: 'Rejected by You' },
    { number: receivedData.noAction, label: 'No Action' },
    { number: receivedData.cancelled, label: 'Cancelled by User' },
    { number: receivedData.expired, label: 'Expired' },
  ];


  const handleGraphToggle = (type) => {
    setActiveGraph(type);
  };

  const currentUserName = user?.username || team?.name;

  return (
    <main className={styles.mainContent}>
      <div className={styles.welcomeSection}>
        <h1>Welcome back, <span className={styles.username}>{currentUserName}!</span></h1>
        <p>Your gaming adventure continues here.</p>
      </div>

      <div className={styles.dashboardSection}>
        <div className={styles.graphControls}>
          <button
            onClick={() => handleGraphToggle('sent')}
            className={`${styles.graphBtn} ${activeGraph === 'sent' ? styles.active : ''}`}
          >
            Requests You Sent
          </button>
          <button
            onClick={() => handleGraphToggle('received')}
            className={`${styles.graphBtn} ${activeGraph === 'received' ? styles.active : ''}`}
          >
            Requests You Received
          </button>
          <button
            onClick={() => handleGraphToggle('both')}
            className={`${styles.graphBtn} ${activeGraph === 'both' ? styles.active : ''}`}
          >
            Both
          </button>
        </div>

        <div className={styles.dashboardContainer}>
          {activeGraph === 'sent' && (
            <DashboardCard
              title="Requests You Sent"
              stats={sentStats}
              chartId="sentChart"
              chartData={sentChartData}
              chartOptions={commonChartOptions}
              isFullScreen={true}
            />
          )}

          {activeGraph === 'received' && (
            <DashboardCard
              title="Requests You Received"
              stats={receivedStats}
              chartId="receivedChart"
              chartData={receivedChartData}
              chartOptions={commonChartOptions}
              isFullScreen={true}
            />
          )}

          {activeGraph === 'both' && (
            <DashboardCard
              title="Requests Summary"
              stats={[]} // No stats displayed for 'both' graph
              chartId="bothChart"
              chartData={bothChartData}
              chartOptions={commonChartOptions}
              legendItems={[
                { label: 'Requests You Sent', colorClass: 'sent' },
                { label: 'Requests You Received', colorClass: 'received' },
              ]}
              isFullScreen={true}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default DashboardMain;