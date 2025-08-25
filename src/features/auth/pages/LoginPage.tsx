import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building, Globe, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const { user, login, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const location = useLocation();
  const [loginError, setLoginError] = useState<string>('');

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@inmoflow.com',
      password: 'demo123'
    }
  });

  if (user) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoginError('');
      await login(data.email, data.password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setLoginError(message);
      showToast({
        type: 'error',
        title: t('auth.invalidCredentials'),
        message
      });
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-primary-600 p-3 rounded-xl">
              <Building className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              InmoFlow AI
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Real Estate CRM & AI Platform
          </p>
        </div>

        {/* Login form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {t('auth.login')}
          </h2>

          {/* Demo credentials info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Demo Credentials:</h3>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p><strong>Admin:</strong> admin@inmoflow.com / demo123</p>
              <p><strong>Agent:</strong> agent@inmoflow.com / demo123</p>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...form.register('email')}
              type="email"
              label={t('auth.email')}
              error={form.formState.errors.email?.message}
              autoComplete="email"
            />
            
            <Input
              {...form.register('password')}
              type="password"
              label={t('auth.password')}
              error={form.formState.errors.password?.message}
              autoComplete="current-password"
            />
            
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              {t('auth.signIn')}
            </Button>
          </form>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="p-2"
          >
            <Globe className="h-4 w-4" />
            <span className="ml-1 text-xs">{i18n.language.toUpperCase()}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}