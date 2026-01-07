'use client';

interface AttendanceStats {
  year: number;
  month: number;
  totalDays: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  checkInCount: number;
  checkOutCount: number;
  attendanceRate: number;
}

interface AttendanceChartProps {
  stats: AttendanceStats | null;
}

export default function AttendanceChart({ stats }: AttendanceChartProps) {
  if (!stats) {
    return <div className="text-center py-8 text-gray-500">No data available</div>;
  }

  const presentPercentage = stats.totalDays > 0 
    ? (stats.presentDays / stats.totalDays) * 100 
    : 0;
  const absentPercentage = stats.totalDays > 0 
    ? (stats.absentDays / stats.totalDays) * 100 
    : 0;

  return (
    <div className="space-y-4">
      {/* Progress Bars */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Present</span>
          <span>{stats.presentDays} days ({presentPercentage.toFixed(1)}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all"
            style={{ width: `${presentPercentage}%` }}
          ></div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Absent</span>
          <span>{stats.absentDays} days ({absentPercentage.toFixed(1)}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-red-500 h-4 rounded-full transition-all"
            style={{ width: `${absentPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.checkInCount}</div>
          <div className="text-xs text-gray-600">Check-Ins</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.checkOutCount}</div>
          <div className="text-xs text-gray-600">Check-Outs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.workingDays}</div>
          <div className="text-xs text-gray-600">Working Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.totalDays}</div>
          <div className="text-xs text-gray-600">Total Days</div>
        </div>
      </div>
    </div>
  );
}

