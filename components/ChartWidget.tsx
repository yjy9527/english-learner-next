"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

const COLORS = ["#5B6ABF", "#68a063", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

interface PieData { name: string; value: number; }
interface BarData { name: string; count: number; }

/** 饼图 */
export function DonutChart({ data, title }: { data: PieData[]; title: string }) {
  if (!data.length) {
    return <div className="text-center text-gray-400 text-sm py-8">暂无数据</div>;
  }
  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={50} outerRadius={80}
            paddingAngle={3} dataKey="value"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/** 柱状图 */
export function BarChartWidget({ data, title }: { data: BarData[]; title: string }) {
  if (!data.length) {
    return <div className="text-center text-gray-400 text-sm py-8">暂无数据</div>;
  }
  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#5B6ABF" radius={[4, 4, 0, 0]} name="数量"
            animationBegin={0} animationDuration={600} animationEasing="ease-out" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
