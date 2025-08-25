import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/app/providers/ThemeProvider';
import { ColumnDef } from '@tanstack/react-table';
import { Settings, Users, FileText, Palette } from 'lucide-react';
import type { User, MarketingTemplate } from '@/features/core/types';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'preferences' | 'users' | 'templates'>('preferences');

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Mock users data since we don't have a real endpoint
      return [
        {
          id: 'user-1',
          email: 'admin@inmoflow.com',
          name: 'Ana García',
          role: 'admin' as const,
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
        },
        {
          id: 'user-2', 
          email: 'agent@inmoflow.com',
          name: 'Carlos Ruiz',
          role: 'agent' as const,
          avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
        }
      ];
    }
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['marketing', 'templates'],
    queryFn: async () => {
      const response = await fetch('/api/marketing/templates');
      return response.json();
    }
  });

  const userColumns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img
            src={row.original.avatar}
            alt={row.original.name}
            className="h-8 w-8 rounded-full"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {row.original.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {row.original.email}
            </p>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <Badge variant={row.original.role}>{row.original.role}</Badge>
    }
  ];

  const templateColumns: ColumnDef<MarketingTemplate>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>
    },
    {
      accessorKey: 'style',
      header: 'Style',
      cell: ({ row }) => <Badge variant="secondary">{row.original.style}</Badge>
    },
    {
      accessorKey: 'template',
      header: 'Template',
      cell: ({ row }) => (
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
          {row.original.template}
        </p>
      )
    }
  ];

  const tabs = [
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'users', label: t('settings.users'), icon: Users },
    { id: 'templates', label: t('settings.templates'), icon: FileText }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('settings.title')}
        subtitle="Manage your application settings and preferences"
      />

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {t('settings.preferences')}
          </h3>
          
          <div className="space-y-6 max-w-md">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.theme')}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choose your preferred theme
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
              >
                <Palette className="h-4 w-4 mr-2" />
                {theme === 'light' ? 'Dark' : 'Light'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.language')}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select your language
                </p>
              </div>
              <Select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                options={[
                  { value: 'es', label: 'Español' },
                  { value: 'en', label: 'English' }
                ]}
                className="w-32"
              />
            </div>

            <Select
              label={t('settings.defaultCurrency')}
              options={[
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'USD', label: 'USD ($)' }
              ]}
              defaultValue="EUR"
            />

            <Input
              label={t('settings.defaultCity')}
              defaultValue="Madrid"
              placeholder="Default city for new properties"
            />
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('settings.users')}
            </h3>
            <Button size="sm">
              Add User
            </Button>
          </div>
          
          <DataTable
            data={users}
            columns={userColumns}
            searchPlaceholder="Search users..."
          />
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('settings.templates')}
            </h3>
            <Button size="sm">
              Add Template
            </Button>
          </div>
          
          <DataTable
            data={templates}
            columns={templateColumns}
            searchPlaceholder="Search templates..."
          />
        </div>
      )}
    </div>
  );
}