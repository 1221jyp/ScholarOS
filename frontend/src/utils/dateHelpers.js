import { format, startOfWeek, addDays, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export const DAYS_OF_WEEK = ['월', '화', '수', '목', '금', '토', '일'];

export const DAY_OF_WEEK_MAP = {
  0: '월',
  1: '화',
  2: '수',
  3: '목',
  4: '금',
  5: '토',
  6: '일',
};

export const getWeekDates = (startDate = new Date()) => {
  const monday = startOfWeek(startDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};

export const formatDate = (date, formatStr = 'yyyy-MM-dd') => {
  if (typeof date === 'string') {
    date = parseISO(date);
  }
  return format(date, formatStr, { locale: ko });
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  // "18:00:00" -> "18:00"
  return timeStr.slice(0, 5);
};

export const getDayOfWeekKorean = (dayNum) => {
  return DAY_OF_WEEK_MAP[dayNum] || '';
};
