import React from 'react';

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon?: string;
}

export function SummaryCard({ label, value, icon }: SummaryCardProps) {
  return (
    <div className="bg-[#232733] rounded-2xl shadow-lg border border-gray-800 p-6 flex flex-col items-center justify-center min-h-[120px]">
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <div className="text-2xl font-extrabold text-gray-100 mb-1">{value}</div>
      <div className="text-xs text-gray-400 font-semibold tracking-wide uppercase">{label}</div>
    </div>
  );
}

export default SummaryCard;