import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const mockActivityData = [
  { date: '2024-01-01', properties: 12, leads: 8, visits: 5 },
  { date: '2024-01-02', properties: 15, leads: 12, visits: 8 },
  { date: '2024-01-03', properties: 18, leads: 15, visits: 12 },
  { date: '2024-01-04', properties: 22, leads: 18, visits: 15 },
  { date: '2024-01-05', properties: 20, leads: 22, visits: 18 },
  { date: '2024-01-06', properties: 25, leads: 20, visits: 22 },
  { date: '2024-01-07', properties: 28, leads: 25, visits: 20 }
];

export function ActivityChart() {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('analytics.activity')} (7 days)
      </h3>
      
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={mockActivityData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            tickFormatter={(date) => new Date(date).getDate().toString()}
          />
          <YAxis stroke="#6B7280" />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <Line type="monotone" dataKey="properties" stroke="#3B82F6" strokeWidth={2} name="Properties" />
          <Line type="monotone" dataKey="leads" stroke="#14B8A6" strokeWidth={2} name="Leads" />
          <Line type="monotone" dataKey="visits" stroke="#F97316" strokeWidth={2} name="Visits" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}