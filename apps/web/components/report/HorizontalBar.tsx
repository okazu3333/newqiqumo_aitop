"use client";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Title,
  type ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip, Title);

export type HorizontalBarProps = {
  labels: string[];
  counts: number[];
  title?: string;
};

export function HorizontalBar({ labels, counts, title }: HorizontalBarProps) {
  const data: ChartData<'bar'> = {
    labels: labels,
    datasets: [
      {
        label: "件数",
        data: counts,
        backgroundColor: labels.map((_, i) => palette[i % palette.length]),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  return (
    <Bar
      data={data}
      options={{
        indexAxis: "y" as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: title ? { display: true, text: title } : { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.formattedValue} 件`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
            grid: { color: "#eef2f5" },
          },
          y: {
            grid: { display: false },
          },
        },
      }}
      height={Math.max(56, labels.length * 38)}
    />
  );
}

const palette = [
  "#138FB5",
  "#60ADC2",
  "#4BBC80",
  "#F59E0B",
  "#D96868",
  "#8B5CF6",
  "#059669",
  "#06B6D4",
];
