import { useHealth } from '@/hooks/useHealth';
import { cn } from '@/lib/utils';
import { Activity, CheckCircle2, XCircle } from 'lucide-react';

export function DashboardFooter() {
  const { data: health, isLoading, isError } = useHealth();

  const getStatusColor = () => {
    if (isLoading) return 'text-yellow-500';
    if (isError) return 'text-red-500';
    return health?.status === 200 ? 'text-green-500' : 'text-red-500';
  };

  const getStatusIcon = () => {
    if (isLoading) return <Activity className="h-4 w-4 animate-pulse" />;
    if (isError) return <XCircle className="h-4 w-4" />;
    return health?.status === 200 ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : (
      <XCircle className="h-4 w-4" />
    );
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    if (isError) return 'Error';
    return health?.status === 200 ? 'OK' : 'Down';
  };

  return (
    <footer className="border-t">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className={cn("flex items-center space-x-1", getStatusColor())}>
              {getStatusIcon()}
              <span className="text-sm font-medium">
                API Status: {getStatusText()}
              </span>
            </span>
          </div>
          {/* {health?.uptime && (
            <div className="text-sm text-muted-foreground">
              Uptime: {Math.floor(health.uptime / 86400)}d {Math.floor((health.uptime % 86400) / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m
            </div>
          )} */}
        </div>
        <div className="flex items-center space-x-4">
          {health?.version && (
            <div className="text-sm text-muted-foreground">
              v{health.version}
            </div>
          )}
          {health?.environment && (
            <div className="text-sm">
              <span className={cn(
                "rounded-full px-2 py-1 text-xs font-medium",
                health.environment === 'production' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              )}>
                {health.environment}
              </span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
