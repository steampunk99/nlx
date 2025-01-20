import { NotificationBell as BaseNotificationBell } from './NotificationBell';
import { cn } from '@/lib/utils';
import {
  DollarSign,
  CreditCard,
  Gift,
  Package,
  Bell
} from 'lucide-react';

// User-specific notification types with icons
const userNotificationTypes = [
  { type: 'ALL', label: 'All Notifications', icon: Bell },
  { type: 'PAYMENT', label: 'Payments', icon: DollarSign },
  { type: 'WITHDRAWAL', label: 'Withdrawals', icon: CreditCard },
  { type: 'COMMISSION', label: 'Commissions', icon: Gift },
  { type: 'PACKAGE', label: 'Packages', icon: Package }
];

// User-specific notification colors
const userNotificationColors = {
  PAYMENT: {
    background: 'bg-emerald-100',
    text: 'text-emerald-800',
    combined: 'bg-emerald-100 text-emerald-800',
    icon: 'text-emerald-600'
  },
  WITHDRAWAL: {
    background: 'bg-blue-100',
    text: 'text-blue-800',
    combined: 'bg-blue-100 text-blue-800',
    icon: 'text-blue-600'
  },
  COMMISSION: {
    background: 'bg-purple-100',
    text: 'text-purple-800',
    combined: 'bg-purple-100 text-purple-800',
    icon: 'text-purple-600'
  },
  PACKAGE: {
    background: 'bg-amber-100',
    text: 'text-amber-800',
    combined: 'bg-amber-100 text-amber-800',
    icon: 'text-amber-600'
  },
  SYSTEM: {
    background: 'bg-gray-100',
    text: 'text-gray-800',
    combined: 'bg-gray-100 text-gray-800',
    icon: 'text-gray-600'
  }
};

// Helper function to get base type
const getBaseType = (type) => {
  if (type.includes('PAYMENT')) return 'PAYMENT';
  if (type.includes('WITHDRAWAL')) return 'WITHDRAWAL';
  if (type.includes('COMMISSION')) return 'COMMISSION';
  if (type.includes('PACKAGE')) return 'PACKAGE';
  return 'SYSTEM';
};

export function UserNotificationBell() {
  return (
    <BaseNotificationBell
      notificationTypes={userNotificationTypes}
      getNotificationColor={(type) => {
        const baseType = getBaseType(type);
        const colors = userNotificationColors[baseType];
        return colors.combined;
      }}
      getNotificationIcon={(type) => {
        // For filter menu items
        const menuItem = userNotificationTypes.find(item => item.type === type);
        if (menuItem) {
          const IconComponent = menuItem.icon;
          return <IconComponent className="h-5 w-5" />;
        }

        // For notification items
        const baseType = getBaseType(type);
        const colors = userNotificationColors[baseType];
        const IconComponent = userNotificationTypes.find(item => item.type === baseType)?.icon || Bell;
        return <IconComponent className={cn("h-5 w-5", colors.icon)} />;
      }}
      className={cn(
        "hover:bg-primary/10",
        "data-[state=open]:bg-primary/10"
      )}
    />
  );
}
