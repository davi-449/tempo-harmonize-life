
import { supabase } from "@/integrations/supabase/client";
import { fetchGoogleCalendarEvents, createGoogleCalendarEvent, updateGoogleCalendarEvent, deleteGoogleCalendarEvent } from './googleCalendar';
import { fetchAllHealthData } from './googleFit';
import { getTokens } from './googleAuth';
import { toast } from 'sonner';

// Synchronize tasks with Google Calendar
export const syncTasksWithGoogleCalendar = async (userId: string, tasks: any[]) => {
  try {
    // Check if the user has Google integration enabled
    const tokens = getTokens(userId);
    if (!tokens) {
      console.log("User has no Google integration");
      return { success: false, message: "No Google integration" };
    }
    
    // Set sync status in localStorage
    localStorage.setItem(`syncStatus_${userId}`, JSON.stringify({
      inProgress: true,
      lastSync: new Date().toISOString(),
      status: 'syncing'
    }));
    
    // Get date range for sync (2 weeks back, 3 months ahead)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const threeMonthsAhead = new Date();
    threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);
    
    // Fetch events from Google Calendar
    const googleEvents = await fetchGoogleCalendarEvents(userId, twoWeeksAgo, threeMonthsAhead);
    
    // Map Google events by ID for easy lookup
    const googleEventsMap = new Map();
    googleEvents.forEach(event => {
      if (event.googleEventId) {
        googleEventsMap.set(event.googleEventId, event);
      }
    });
    
    // Map tasks by Google event ID for easy lookup
    const tasksWithGoogleIdMap = new Map();
    tasks.filter(task => task.googleEventId).forEach(task => {
      tasksWithGoogleIdMap.set(task.googleEventId, task);
    });
    
    // Track changes
    const changes = {
      created: 0,
      updated: 0,
      deleted: 0
    };
    
    // Process each task
    for (const task of tasks) {
      // Skip tasks without a due date
      if (!task.dueDate) continue;
      
      if (task.googleEventId) {
        // Task has a Google event ID, check if it exists in Google
        if (googleEventsMap.has(task.googleEventId)) {
          // Event exists in Google, check if it needs update
          const googleEvent = googleEventsMap.get(task.googleEventId);
          
          // Simple check to see if update is needed - compare titles and times
          if (task.title !== googleEvent.title ||
              task.startTime !== googleEvent.startTime ||
              task.endTime !== googleEvent.endTime) {
            
            // Update Google event
            await updateGoogleCalendarEvent(userId, task.googleEventId, task);
            changes.updated++;
          }
          
          // Remove from map to track processed events
          googleEventsMap.delete(task.googleEventId);
        } else {
          // Event doesn't exist in Google anymore, recreate it
          const newEvent = await createGoogleCalendarEvent(userId, task);
          if (newEvent && newEvent.id) {
            // Update task with new Google event ID
            // In a real app, update the task in your storage
            task.googleEventId = newEvent.id;
            changes.created++;
          }
        }
      } else {
        // Task has no Google event ID, create new event
        const newEvent = await createGoogleCalendarEvent(userId, task);
        if (newEvent && newEvent.id) {
          // Update task with Google event ID
          // In a real app, update the task in your storage
          task.googleEventId = newEvent.id;
          changes.created++;
        }
      }
    }
    
    // Process remaining Google events not linked to tasks
    // These are events that exist in Google Calendar but not in our app
    for (const [eventId, googleEvent] of googleEventsMap.entries()) {
      // Create tasks from these Google events
      const newTask = {
        ...googleEvent,
        userId: userId,
      };
      
      // In a real app, add this task to your storage
      console.log("New task from Google:", newTask);
      changes.created++;
    }
    
    // Update sync status
    localStorage.setItem(`syncStatus_${userId}`, JSON.stringify({
      inProgress: false,
      lastSync: new Date().toISOString(),
      status: 'success',
      changes
    }));
    
    toast.success(`Sincronização concluída: ${changes.created} criados, ${changes.updated} atualizados, ${changes.deleted} excluídos`);
    
    return { 
      success: true, 
      message: "Sync completed", 
      changes 
    };
  } catch (error) {
    console.error("Error syncing with Google Calendar:", error);
    
    // Update sync status
    localStorage.setItem(`syncStatus_${userId}`, JSON.stringify({
      inProgress: false,
      lastSync: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
    
    toast.error("Falha na sincronização com o Google Calendar");
    return { 
      success: false, 
      message: "Sync failed", 
      error 
    };
  }
};

// Synchronize health data with Google Fit
export const syncHealthDataWithGoogleFit = async (userId: string) => {
  try {
    // Check if the user has Google integration enabled
    const tokens = getTokens(userId);
    if (!tokens) {
      console.log("User has no Google integration");
      return { success: false, message: "No Google integration" };
    }
    
    // Set sync status in localStorage
    localStorage.setItem(`healthSyncStatus_${userId}`, JSON.stringify({
      inProgress: true,
      lastSync: new Date().toISOString(),
      status: 'syncing'
    }));
    
    // Get date range for sync (30 days back)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const today = new Date();
    
    // Fetch health data from Google Fit
    const healthData = await fetchAllHealthData(userId, thirtyDaysAgo, today);
    
    // In a real app, store health data in your database
    console.log("Health data fetched:", healthData);
    
    // Update sync status
    localStorage.setItem(`healthSyncStatus_${userId}`, JSON.stringify({
      inProgress: false,
      lastSync: new Date().toISOString(),
      status: 'success',
      count: healthData.length
    }));
    
    toast.success(`Dados de saúde sincronizados: ${healthData.length} dias de dados`);
    
    return { 
      success: true, 
      message: "Health data sync completed",
      data: healthData
    };
  } catch (error) {
    console.error("Error syncing with Google Fit:", error);
    
    // Update sync status
    localStorage.setItem(`healthSyncStatus_${userId}`, JSON.stringify({
      inProgress: false,
      lastSync: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
    
    toast.error("Falha na sincronização com o Google Fit");
    return { 
      success: false, 
      message: "Health data sync failed", 
      error 
    };
  }
};

// Get sync status
export const getSyncStatus = (userId: string) => {
  try {
    const calendarStatus = localStorage.getItem(`syncStatus_${userId}`);
    const healthStatus = localStorage.getItem(`healthSyncStatus_${userId}`);
    
    return {
      calendar: calendarStatus ? JSON.parse(calendarStatus) : null,
      health: healthStatus ? JSON.parse(healthStatus) : null
    };
  } catch (error) {
    console.error("Error getting sync status:", error);
    return { calendar: null, health: null };
  }
};

// Correlate health data with productivity
export const correlateHealthWithProductivity = (healthData: any[], tasks: any[]) => {
  try {
    // Group tasks by date
    const tasksByDate: Record<string, any[]> = {};
    tasks.forEach(task => {
      if (!task.dueDate) return;
      
      const dateStr = new Date(task.dueDate).toISOString().split('T')[0];
      if (!tasksByDate[dateStr]) {
        tasksByDate[dateStr] = [];
      }
      tasksByDate[dateStr].push(task);
    });
    
    // Calculate productivity metrics by date
    const productivityByDate: Record<string, any> = {};
    Object.entries(tasksByDate).forEach(([date, dateTasks]) => {
      const completedTasks = dateTasks.filter(task => task.completed);
      
      productivityByDate[date] = {
        date,
        totalTasks: dateTasks.length,
        completedTasks: completedTasks.length,
        completionRate: dateTasks.length > 0 ? completedTasks.length / dateTasks.length : 0
      };
    });
    
    // Correlate health data with productivity
    const correlations = [];
    
    for (const healthItem of healthData) {
      const date = healthItem.date;
      const productivity = productivityByDate[date];
      
      if (productivity) {
        correlations.push({
          date,
          steps: healthItem.steps || 0,
          sleepHours: healthItem.sleepHours || 0,
          heartRate: healthItem.heartRate || 0,
          totalTasks: productivity.totalTasks,
          completedTasks: productivity.completedTasks,
          completionRate: productivity.completionRate
        });
      }
    }
    
    // Calculate insights
    const insights = [];
    
    // Sleep correlation
    if (correlations.length >= 5) {
      const goodSleepDays = correlations.filter(day => day.sleepHours >= 7);
      const badSleepDays = correlations.filter(day => day.sleepHours < 7 && day.sleepHours > 0);
      
      if (goodSleepDays.length >= 3 && badSleepDays.length >= 3) {
        const avgCompletionGoodSleep = goodSleepDays.reduce((sum, day) => sum + day.completionRate, 0) / goodSleepDays.length;
        const avgCompletionBadSleep = badSleepDays.reduce((sum, day) => sum + day.completionRate, 0) / badSleepDays.length;
        
        const percentDifference = ((avgCompletionGoodSleep - avgCompletionBadSleep) / avgCompletionBadSleep) * 100;
        
        if (percentDifference > 10) {
          insights.push({
            type: 'sleep',
            description: `Você completa cerca de ${percentDifference.toFixed(0)}% mais tarefas nos dias em que dorme 7 horas ou mais.`,
            impact: 'positive',
            confidence: percentDifference > 30 ? 'high' : 'medium'
          });
        }
      }
    }
    
    // Steps correlation
    if (correlations.length >= 5) {
      const activeStepsDays = correlations.filter(day => day.steps >= 8000);
      const inactiveStepsDays = correlations.filter(day => day.steps < 8000 && day.steps > 0);
      
      if (activeStepsDays.length >= 3 && inactiveStepsDays.length >= 3) {
        const avgCompletionActiveSteps = activeStepsDays.reduce((sum, day) => sum + day.completionRate, 0) / activeStepsDays.length;
        const avgCompletionInactiveSteps = inactiveStepsDays.reduce((sum, day) => sum + day.completionRate, 0) / inactiveStepsDays.length;
        
        const percentDifference = ((avgCompletionActiveSteps - avgCompletionInactiveSteps) / avgCompletionInactiveSteps) * 100;
        
        if (percentDifference > 10) {
          insights.push({
            type: 'steps',
            description: `Você completa cerca de ${percentDifference.toFixed(0)}% mais tarefas nos dias em que dá 8.000 passos ou mais.`,
            impact: 'positive',
            confidence: percentDifference > 30 ? 'high' : 'medium'
          });
        }
      }
    }
    
    return {
      correlations,
      insights
    };
  } catch (error) {
    console.error("Error correlating health with productivity:", error);
    return { correlations: [], insights: [] };
  }
};
