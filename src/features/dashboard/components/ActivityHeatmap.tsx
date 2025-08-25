import { useState } from 'react';
import { Activity, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

interface ActivityData {
  day: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  value: number; // Activity intensity
  count: number; // Number of activities
}

interface ActivityHeatmapProps {
  className?: string;
}

export function ActivityHeatmap({ className = '' }: ActivityHeatmapProps) {
  const { t } = useTranslation();
  const [hoveredCell, setHoveredCell] = useState<ActivityData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Generate mock heatmap data
  const generateMockData = (): ActivityData[] => {
    const data: ActivityData[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        // Simulate realistic activity patterns
        let value = 0;
        
        // Business hours (9-18) have higher activity
        if (hour >= 9 && hour <= 18) {
          value += Math.random() * 0.8 + 0.2;
        }
        
        // Weekdays have more activity than weekends
        if (day >= 1 && day <= 5) {
          value += Math.random() * 0.5;
        } else {
          value *= 0.3; // Reduce weekend activity
        }
        
        // Add some randomness
        value += Math.random() * 0.3;
        
        data.push({
          day,
          hour,
          value: Math.min(value, 1), // Cap at 1
          count: Math.floor(value * 20) // Convert to count
        });
      }
    }
    return data;
  };

  const { data: activityData = generateMockData() } = useQuery({
    queryKey: ['activityHeatmap'],
    queryFn: async () => {
      // In real app: const response = await fetch('/api/analytics/activity-heatmap');
      // return response.json();
      return generateMockData();
    }
  });

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getIntensityColor = (value: number) => {
    const opacity = Math.max(0.1, value);
    return `rgba(59, 130, 246, ${opacity})`; // Blue with varying opacity
  };

  const getIntensityLevel = (value: number) => {
    if (value >= 0.8) return 'Very High';
    if (value >= 0.6) return 'High';
    if (value >= 0.4) return 'Medium';
    if (value >= 0.2) return 'Low';
    return 'Very Low';
  };

  const handleCellHover = (data: ActivityData, event: React.MouseEvent) => {
    setHoveredCell(data);
    setMousePos({ x: event.clientX, y: event.clientY });
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activity Heatmap
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Info className="h-4 w-4" />
          <span>Last 7 days</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative">
        {/* Time labels (hours) */}
        <div className="flex mb-2 ml-12">
          {[0, 6, 12, 18].map((hour) => (
            <div
              key={hour}
              className="flex-1 text-xs text-gray-500 dark:text-gray-400 text-center"
              style={{ marginLeft: hour === 0 ? '0' : '25%' }}
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Days and cells */}
        {days.map((day, dayIndex) => (
          <div key={day} className="flex items-center mb-1">
            {/* Day label */}
            <div className="w-10 text-xs text-gray-500 dark:text-gray-400 text-right mr-2">
              {day}
            </div>
            
            {/* Hour cells */}
            <div className="flex gap-1">
              {hours.map((hour) => {
                const cellData = activityData.find(
                  (d) => d.day === dayIndex && d.hour === hour
                );
                
                return (
                  <div
                    key={hour}
                    className="w-3 h-3 rounded-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-150"
                    style={{
                      backgroundColor: cellData
                        ? getIntensityColor(cellData.value)
                        : 'rgba(156, 163, 175, 0.1)'
                    }}
                    onMouseEnter={(e) => cellData && handleCellHover(cellData, e)}
                    onMouseLeave={() => setHoveredCell(null)}
                    onMouseMove={(e) => cellData && handleCellHover(cellData, e)}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Less</span>
            <div className="flex gap-1">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((intensity, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded-sm border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: getIntensityColor(intensity) }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Activity includes: views, inquiries, visits, updates
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none"
          style={{
            left: mousePos.x + 10,
            top: mousePos.y - 40,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-medium">
            {days[hoveredCell.day]} at {formatHour(hoveredCell.hour)}
          </div>
          <div className="text-gray-300">
            {hoveredCell.count} activities ({getIntensityLevel(hoveredCell.value)})
          </div>
        </div>
      )}
    </div>
  );
}