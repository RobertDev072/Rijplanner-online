import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

// Check if running on native platform
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

// Haptic feedback functions
export const hapticImpact = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
  if (!isNativePlatform()) return;
  
  const impactStyle = {
    light: ImpactStyle.Light,
    medium: ImpactStyle.Medium,
    heavy: ImpactStyle.Heavy,
  }[style];
  
  try {
    await Haptics.impact({ style: impactStyle });
  } catch (error) {
    console.log('Haptics not available');
  }
};

export const hapticNotification = async (type: 'success' | 'warning' | 'error' = 'success') => {
  if (!isNativePlatform()) return;
  
  const notificationType = {
    success: NotificationType.Success,
    warning: NotificationType.Warning,
    error: NotificationType.Error,
  }[type];
  
  try {
    await Haptics.notification({ type: notificationType });
  } catch (error) {
    console.log('Haptics not available');
  }
};

export const hapticSelection = async () => {
  if (!isNativePlatform()) return;
  
  try {
    await Haptics.selectionStart();
    await Haptics.selectionChanged();
    await Haptics.selectionEnd();
  } catch (error) {
    console.log('Haptics not available');
  }
};

// Vibrate for a duration
export const vibrate = async (duration: number = 300) => {
  if (!isNativePlatform()) return;
  
  try {
    await Haptics.vibrate({ duration });
  } catch (error) {
    console.log('Haptics not available');
  }
};
