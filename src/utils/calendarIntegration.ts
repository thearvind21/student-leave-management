
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
  location?: string;
}

export const generateICSFile = (events: CalendarEvent[]): string => {
  let ics = 'BEGIN:VCALENDAR\n';
  ics += 'VERSION:2.0\n';
  ics += 'PRODID:-//Leave Management System//Calendar//EN\n';
  ics += 'CALSCALE:GREGORIAN\n';
  ics += 'METHOD:PUBLISH\n';
  
  events.forEach((event) => {
    const startDate = formatDateForICS(event.start);
    const endDate = event.end ? formatDateForICS(event.end) : startDate;
    
    ics += 'BEGIN:VEVENT\n';
    ics += `UID:${event.id}@leavemanagementsystem.com\n`;
    ics += `DTSTAMP:${formatDateForICS(new Date().toISOString())}\n`;
    ics += `DTSTART:${startDate}\n`;
    ics += `DTEND:${endDate}\n`;
    ics += `SUMMARY:${escapeICSText(event.title)}\n`;
    
    if (event.description) {
      ics += `DESCRIPTION:${escapeICSText(event.description)}\n`;
    }
    
    if (event.location) {
      ics += `LOCATION:${escapeICSText(event.location)}\n`;
    }
    
    ics += 'STATUS:CONFIRMED\n';
    ics += 'END:VEVENT\n';
  });
  
  ics += 'END:VCALENDAR';
  return ics;
};

const formatDateForICS = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

const escapeICSText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
};

export const createGoogleCalendarUrl = (event: CalendarEvent): string => {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const startDate = formatDateForICS(event.start);
  const endDate = event.end ? formatDateForICS(event.end) : startDate;
  
  const params = new URLSearchParams({
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description || '',
    location: event.location || ''
  });
  
  return `${baseUrl}&${params.toString()}`;
};

export const createOutlookCalendarUrl = (event: CalendarEvent): string => {
  const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
  
  const params = new URLSearchParams({
    subject: event.title,
    startdt: event.start,
    enddt: event.end || event.start,
    body: event.description || '',
    location: event.location || ''
  });
  
  return `${baseUrl}?${params.toString()}`;
};

export const exportToGoogleCalendar = (event: CalendarEvent): void => {
  const googleUrl = createGoogleCalendarUrl(event);
  window.open(googleUrl, '_blank');
};

export const exportToOutlook = (event: CalendarEvent): void => {
  const outlookUrl = createOutlookCalendarUrl(event);
  window.open(outlookUrl, '_blank');
};

export const downloadICSFile = (events: CalendarEvent[], filename: string = 'calendar-export.ics'): void => {
  const icsContent = generateICSFile(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(link.href);
};
