import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone (you can change this to your preferred timezone)
dayjs.tz.setDefault('Africa/Lagos');

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(date).format(format);
};

export const formatRelativeTime = (date: string | Date) => {
  return dayjs(date).fromNow();
};

export const formatCurrency = (amount: number, currency = 'NGN') => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (number: number) => {
  return new Intl.NumberFormat('en-NG').format(number);
};

export const isToday = (date: string | Date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isYesterday = (date: string | Date) => {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
};

export const getDateRange = (days: number) => {
  const end = dayjs();
  const start = dayjs().subtract(days, 'day');
  return { start, end };
};

export default dayjs;
