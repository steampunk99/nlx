import { useState, useEffect } from 'react';

const PREF_KEY = 'notification_preferences';

const defaultPreferences = {
  soundEnabled: true,
  desktopEnabled: false
};

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem(PREF_KEY);
    return saved ? JSON.parse(saved) : defaultPreferences;
  });

  const updatePreferences = (newPrefs) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem(PREF_KEY, JSON.stringify(updated));
  };

  const toggleSound = () => {
    updatePreferences({ soundEnabled: !preferences.soundEnabled });
  };

  const toggleDesktopNotifications = async () => {
    if (!preferences.desktopEnabled) {
      // Request permission for desktop notifications
      const permission = await Notification.requestPermission();
      updatePreferences({ desktopEnabled: permission === 'granted' });
    } else {
      updatePreferences({ desktopEnabled: false });
    }
  };

  return {
    preferences,
    toggleSound,
    toggleDesktopNotifications
  };
}
