import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { AestheticScores } from '../types';

interface AestheticRadarChartProps {
  scores: AestheticScores;
}

const AestheticRadarChart: React.FC<AestheticRadarChartProps> = ({ scores }) => {
  const data = [
    { subject: '眼部美感', A: scores.eyes, fullMark: 100 },
    { subject: '脸颊协调', A: scores.cheeks, fullMark: 100 },
    { subject: '唇形', A: scores.lips, fullMark: 100 },
    { subject: '眉形设计', A: scores.brows, fullMark: 100 },
    { subject: '下颌轮廓', A: scores.jawline, fullMark: 100 },
    { subject: '对称性', A: scores.symmetry, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[320px] flex justify-center items-center bg-white rounded-2xl p-6 shadow-soft border border-sys-text-light/5">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#E8D5D2" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#8C8C8C', fontSize: 12, fontFamily: '"Noto Sans SC", sans-serif', fontWeight: 300 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="美学评分"
            dataKey="A"
            stroke="#B08D87"
            strokeWidth={1.5}
            fill="#B08D87"
            fillOpacity={0.3}
          />
          <Tooltip 
            cursor={false}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '8px 12px'
            }}
            itemStyle={{ color: '#B08D87', fontSize: '13px', fontWeight: 500 }}
            formatter={(value: number) => [`${value}%`, '评分']}
            labelStyle={{ display: 'none' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AestheticRadarChart;