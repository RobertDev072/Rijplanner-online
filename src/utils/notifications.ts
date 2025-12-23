// PWA Push Notifications utility

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendLessonNotification(
  type: 'planned' | 'accepted',
  studentName: string,
  instructorName: string,
  date: string,
  time: string
) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const title = type === 'planned' 
    ? '📅 Nieuwe les gepland' 
    : '✅ Les geaccepteerd';
  
  const body = type === 'planned'
    ? `Les met ${instructorName} op ${date} om ${time}`
    : `Je les op ${date} om ${time} is bevestigd`;

  const notification = new Notification(title, {
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: `lesson-${type}-${Date.now()}`,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

export function checkNotificationSupport(): boolean {
  return 'Notification' in window;
}
