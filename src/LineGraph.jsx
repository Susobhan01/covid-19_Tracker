
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

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

const options = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
                label: function (context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += numeral(context.parsed.y).format("0,0");
                    }
                    return label;
                },
            },
        },
    },
    elements: {
        point: {
            radius: 0,
        },
        line: {
            tension: 0.3,
        },
    },
    maintainAspectRatio: false,
    scales: {
        x: {
            type: 'category',
            ticks: {
                autoSkip: true,
                maxTicksLimit: 20
            }
        },
        y: {
            beginAtZero: true,
            grid: {
                display: false,
            },
            ticks: {
                precision: 0,
                callback: function (value) {
                    if (value >= 1000000) {
                        return numeral(value).format("0.0a");
                    }
                    return numeral(value).format("0a");
                },
            },
        },
    },
};

const buildChartData = (data, casesType) => {
    let chartData = [];
    let lastDataPoint;

    let dataPoints;
    if (data.timeline) {
        dataPoints = data.timeline[casesType];
    } else if (data[casesType]) {
        dataPoints = data[casesType];
    }

    if (!dataPoints) return [];

    for (let date in dataPoints) {
        if (casesType === 'recovered') {
            // For recovered, use cumulative total directly
            if (dataPoints[date] > 0) {
                chartData.push({
                    x: date,
                    y: dataPoints[date],
                });
            }
        } else {
            // For cases/deaths use daily difference
            if (lastDataPoint !== undefined) {
                let diff = dataPoints[date] - lastDataPoint;
                if (diff >= 0) {
                    chartData.push({
                        x: date,
                        y: diff,
                    });
                }
            }
            lastDataPoint = dataPoints[date];
        }
    }
    return chartData;
};

const casesTypeColors = {
    cases: {
        hex: "#CC1034",
        rgb: "rgb(204, 16, 52)",
        half_op: "rgba(204, 16, 52, 0.5)",
    },
    recovered: {
        hex: "#7dd71d",
        rgb: "rgb(125, 215, 29)",
        half_op: "rgba(125, 215, 29, 0.5)",
    },
    deaths: {
        hex: "#fb4443",
        rgb: "rgb(251, 68, 67)",
        half_op: "rgba(251, 68, 67, 0.5)",
    },
};

function LineGraph({ casesType = "cases", country = "worldwide", ...props }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const url = country === "worldwide"
                ? "https://disease.sh/v3/covid-19/historical/all?lastdays=120"
                : `https://disease.sh/v3/covid-19/historical/${country}?lastdays=120`;

            await fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    let chartData = buildChartData(data, casesType);
                    setData(chartData);
                })
                .catch((error) => console.error("Error fetching graph data:", error));
        };

        fetchData();
    }, [casesType, country]);

    const hasData = data?.length > 0 && data.some(point => point.y > 0);

    return (
        <div className={props.className}>
            {hasData ? (
                <Line
                    data={{
                        datasets: [
                            {
                                backgroundColor: casesTypeColors[casesType].half_op,
                                borderColor: casesTypeColors[casesType].hex,
                                fill: true,
                                data: data,
                            },
                        ],
                    }}
                    options={options}
                />
            ) : (
                <div style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#777",
                    textAlign: "center",
                    padding: "20px"
                }}>
                    <h4 style={{ marginBottom: "10px", fontSize: "1.2rem" }}>No Historical Data</h4>
                    <p style={{ fontSize: "0.9rem" }}>
                        Data not available for this period.
                    </p>
                </div>
            )}
        </div>
    );
}

export default LineGraph;
