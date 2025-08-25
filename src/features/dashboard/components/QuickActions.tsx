import { useState } from 'react';
import { Plus, Home, Users, FileText, Calendar, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className = '' }: QuickActionsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      id: 'new-property',
      label: 'New Property',
      icon: Home,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => navigate('/properties/new')
    },
    {
      id: 'new-lead',
      label: 'New Lead',
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => navigate('/leads/new')
    },
    {
      id: 'create-report',
      label: 'Create Report',
      icon: FileText,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => navigate('/analytics/reports')
    },
    {
      id: 'schedule-visit',
      label: 'Schedule Visit',
      icon: Calendar,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => navigate('/visits/schedule')
    }
  ];

  const handleActionClick = (action: typeof actions[0]) => {
    action.action();
    setIsOpen(false);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className={`transform transition-all duration-300 ease-out ${
                  isOpen 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-4 opacity-0 scale-95'
                }`}
                style={{ 
                  transitionDelay: `${index * 50}ms`,
                  transformOrigin: 'bottom right'
                }}
              >
                <Button
                  onClick={() => handleActionClick(action)}
                  className={`${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 min-w-44 justify-start gap-3`}
                  size="sm"
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen 
            ? 'bg-gray-600 hover:bg-gray-700' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full w-14 h-14 p-0`}
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform duration-200" />
        ) : (
          <Zap className="h-6 w-6 transition-transform duration-200" />
        )}
      </Button>
    </div>
  );
}