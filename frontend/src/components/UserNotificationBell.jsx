import { NotificationBell as BaseNotificationBell } from './NotificationBell';
import { cn } from '@/lib/utils';

// --- Cocoa Farm SVG Icons ---
const CocoaPod = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none"><ellipse cx="16" cy="16" rx="12" ry="16" fill="#8B5C2A" stroke="#5C3310" strokeWidth="2" /><ellipse cx="16" cy="16" rx="8" ry="12" fill="#D2A86A" stroke="#8B5C2A" strokeWidth="1.5" /><ellipse cx="16" cy="16" rx="4" ry="8" fill="#F7E1B5" stroke="#D2A86A" strokeWidth="1" /></svg>
);
const Farmer = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="12" r="6" fill="#A7F3D0" stroke="#059669" strokeWidth="2" /><ellipse cx="16" cy="24" rx="10" ry="6" fill="#FBBF24" stroke="#B45309" strokeWidth="2" /></svg>
);
const FarmCoin = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#FFD700" stroke="#B8860B" strokeWidth="2" /><ellipse cx="16" cy="16" rx="8" ry="8" fill="#FFF8DC" stroke="#FFD700" strokeWidth="1.5" /><path d="M12 16h8M16 12v8" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" /></svg>
);
const FarmGift = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none"><rect x="6" y="14" width="20" height="12" rx="2" fill="#FFE066" stroke="#C97C3A" strokeWidth="2"/><rect x="13" y="20" width="6" height="6" rx="1" fill="#B6D7B0"/><path d="M4 16L16 6l12 10" stroke="#B6D7B0" strokeWidth="2"/></svg>
);

// --- Themed notification types ---
const userNotificationTypes = [
  { type: 'ALL', label: 'All Notifications', icon: CocoaPod },
  { type: 'PAYMENT', label: 'Payments', icon: FarmCoin },
  { type: 'WITHDRAWAL', label: 'Withdrawals', icon: FarmCoin },
  { type: 'COMMISSION', label: 'Commissions', icon: FarmGift },
  { type: 'PACKAGE', label: 'Packages', icon: Farmer }
];

// --- Themed notification colors ---
const userNotificationColors = {
  PAYMENT: {
    background: 'bg-emerald-100',
    text: 'text-emerald-900',
    combined: 'bg-emerald-100 text-emerald-900',
    icon: 'text-emerald-600'
  },
  WITHDRAWAL: {
    background: 'bg-blue-100',
    text: 'text-blue-900',
    combined: 'bg-blue-100 text-blue-900',
    icon: 'text-blue-600'
  },
  COMMISSION: {
    background: 'bg-yellow-100',
    text: 'text-yellow-900',
    combined: 'bg-yellow-100 text-yellow-900',
    icon: 'text-yellow-600'
  },
  PACKAGE: {
    background: 'bg-amber-100',
    text: 'text-amber-900',
    combined: 'bg-amber-100 text-amber-900',
    icon: 'text-amber-600'
  },
  SYSTEM: {
    background: 'bg-[#e6f2ef]',
    text: 'text-[#4e3b1f]',
    combined: 'bg-[#e6f2ef] text-[#4e3b1f]',
    icon: 'text-[#8B5C2A]'
  }
};

// Helper function to get base type
const getBaseType = (type) => {
  if (type && type.includes('PAYMENT')) return 'PAYMENT';
  if (type && type.includes('WITHDRAWAL')) return 'WITHDRAWAL';
  if (type && type.includes('COMMISSION')) return 'COMMISSION';
  if (type && type.includes('PACKAGE')) return 'PACKAGE';
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
        const IconComponent = userNotificationTypes.find(item => item.type === baseType)?.icon || CocoaPod;
        return <IconComponent className={cn("h-5 w-5", colors.icon)} />;
      }}
      className={cn(
        "hover:bg-[#b6d7b0]/20",
        "data-[state=open]:bg-[#b6d7b0]/20"
      )}
    />
  );
}
