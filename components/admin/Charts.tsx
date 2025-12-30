'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface GrowthChartProps {
  data: { name: string; users: number; cases: number }[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray='3 3' className='stroke-gray-200 dark:stroke-gray-700' />
        <XAxis dataKey='name' className='text-xs' />
        <YAxis className='text-xs' />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--tooltip-bg, white)', 
            border: '1px solid var(--tooltip-border, #e5e7eb)',
            borderRadius: '0.5rem'
          }} 
        />
        <Legend />
        <Bar dataKey='users' fill='#3b82f6' name='신규 사용자' />
        <Bar dataKey='cases' fill='#10b981' name='신규 케이스' />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface FileTypeChartProps {
  data: { name: string; value: number; color: string }[];
}

export function FileTypeChart({ data }: FileTypeChartProps) {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie
          data={data}
          cx='50%'
          cy='50%'
          labelLine={false}
          label={({ name, percent }) => ` ${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill='#8884d8'
          dataKey='value'
        >
          {data.map((entry, index) => (
            <Cell key={` cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}