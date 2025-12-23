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

type NotificationType = 'planned' | 'accepted' | 'cancelled' | 'refused';

const NOTIFICATION_CONFIG: Record<NotificationType, { title: string; getMessage: (name: string, date: string, time: string) => string }> = {
  planned: {
    title: '📅 Nieuwe les gepland',
    getMessage: (name, date, time) => `Les met ${name} op ${date} om ${time}`,
  },
  accepted: {
    title: '✅ Les geaccepteerd',
    getMessage: (name, date, time) => `Je les op ${date} om ${time} is bevestigd`,
  },
  cancelled: {
    title: '❌ Les geannuleerd',
    getMessage: (name, date, time) => `De les op ${date} om ${time} is geannuleerd`,
  },
  refused: {
    title: '🚫 Les geweigerd',
    getMessage: (name, date, time) => `De les op ${date} om ${time} is geweigerd`,
  },
};

export function sendLessonNotification(
  type: NotificationType,
  studentName: string,
  instructorName: string,
  date: string,
  time: string
) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const config = NOTIFICATION_CONFIG[type];
  const name = type === 'planned' ? instructorName : studentName;

  const notification = new Notification(config.title, {
    body: config.getMessage(name, date, time),
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
