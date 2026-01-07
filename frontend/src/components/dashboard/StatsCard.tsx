'use client';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: string;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  color = 'blue', 
  trend,
  delay = 0 
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
  };

  return (
    <div 
      className={`p-4 md:p-6 rounded-lg border-2 shadow-md hover-lift transition-smooth ${colorClasses[color]} animate-scaleIn`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs md:text-sm font-medium opacity-75">{title}</h3>
        {icon && <span className="text-xl md:text-2xl">{icon}</span>}
      </div>
      <div className="flex items-baseline justify-between">
        <p className="text-2xl md:text-3xl font-bold">{value}</p>
        {trend && (
          <span
            className={`text-xs md:text-sm font-medium flex items-center ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
              </svg>
            )}
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}

