
import { ensureValidToken } from './googleAuth';
import { toast } from 'sonner';

// Convert TempoApp event to Google Calendar event format
export const convertToGoogleEvent = (task: any) => {
  return {
    summary: task.title,
    description: task.description || '',
    start: {
      dateTime: task.dueDate instanceof Date ? 
        task.dueDate.toISOString() : 
        new Date(task.dueDate).toISOString(),
      timeZone: 'America/Sao_Paulo'
    },
    end: {
      dateTime: task.endTime ? 
        new Date(task.dueDate.setHours(
          parseInt(task.endTime.split(':')[0]), 
          parseInt(task.endTime.split(':')[1])
        )).toISOString() : 
        new Date(new Date(task.dueDate).getTime() + 3600000).toISOString(), // Default 1 hour later
      timeZone: 'America/Sao_Paulo'
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: task.reminderTime || 30 }
      ]
    }
  };
};

// Convert Google Calendar event to TempoApp task format
export const convertToTask = (event: any) => {
  // Extract date and time
  const startDateTime = new Date(event.start.dateTime || event.start.date);
  let endDateTime = event.end ? 
    new Date(event.end.dateTime || event.end.date) : 
    new Date(startDateTime.getTime() + 3600000);
  
  // Format times for our app
  const startTime = startDateTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const endTime = endDateTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  // Create task object
  return {
    id: `gc-${event.id}`, // Prefix to identify Google Calendar events
    title: event.summary || 'Sem título',
    description: event.description || '',
    dueDate: startDateTime,
    completed: event.status === 'completed',
    category: 'personal', // Default category
    priority: 'medium', // Default priority
    userId: '', // Will be filled in sync function
    createdAt: new Date(),
    updatedAt: new Date(),
    startTime: startTime,
    endTime: endTime,
    isRecurring: event.recurrence ? true : false,
    googleEventId: event.id
  };
};

// Fetch events from Google Calendar
export const fetchGoogleCalendarEvents = async (userId: string, startDate: Date, endDate: Date) => {
  try {
    const accessToken = await ensureValidToken(userId);
    if (!accessToken) {
      throw new Error('No valid access token available');
    }
    
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}&singleEvents=true`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items.map((event: any) => convertToTask(event));
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    toast.error("Falha ao buscar eventos do Google Calendar");
    return [];
  }
};

// Create event in Google Calendar
export const createGoogleCalendarEvent = async (userId: string, task: any) => {
  try {
    const accessToken = await ensureValidToken(userId);
    if (!accessToken) {
      throw new Error('No valid access token available');
    }
    
    const googleEvent = convertToGoogleEvent(task);
    
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(googleEvent)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.status}`);
    }
    
    const data = await response.json();
    toast.success("Evento criado no Google Calendar");
    return data;
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
    toast.error("Falha ao criar evento no Google Calendar");
    return null;
  }
};

// Update event in Google Calendar
export const updateGoogleCalendarEvent = async (userId: string, eventId: string, task: any) => {
  try {
    const accessToken = await ensureValidToken(userId);
    if (!accessToken) {
      throw new Error('No valid access token available');
    }
    
    const googleEvent = convertToGoogleEvent(task);
    
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(googleEvent)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update event: ${response.status}`);
    }
    
    const data = await response.json();
    toast.success("Evento atualizado no Google Calendar");
    return data;
  } catch (error) {
    console.error("Error updating Google Calendar event:", error);
    toast.error("Falha ao atualizar evento no Google Calendar");
    return null;
  }
};

// Delete event from Google Calendar
export const deleteGoogleCalendarEvent = async (userId: string, eventId: string) => {
  try {
    const accessToken = await ensureValidToken(userId);
    if (!accessToken) {
      throw new Error('No valid access token available');
    }
    
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete event: ${response.status}`);
    }
    
    toast.success("Evento excluído do Google Calendar");
    return true;
  } catch (error) {
    console.error("Error deleting Google Calendar event:", error);
    toast.error("Falha ao excluir evento do Google Calendar");
    return false;
  }
};
