
import { ensureValidToken } from './googleAuth';
import { toast } from 'sonner';

// Process step data from Google Fit response
const processStepData = (data: any) => {
  if (!data || !data.bucket) return [];

  return data.bucket.map((bucket: any) => {
    const startDate = new Date(parseInt(bucket.startTimeMillis));
    const steps = bucket.dataset[0]?.point?.reduce((total: number, point: any) => {
      return total + (point.value[0]?.intVal || 0);
    }, 0) || 0;
    
    return {
      date: startDate.toISOString().split('T')[0],
      steps
    };
  });
};

// Process sleep data from Google Fit response
const processSleepData = (data: any) => {
  if (!data || !data.bucket) return [];

  return data.bucket.map((bucket: any) => {
    const startDate = new Date(parseInt(bucket.startTimeMillis));
    
    // Sum up sleep segments in hours
    let sleepHours = 0;
    bucket.dataset[0]?.point?.forEach((point: any) => {
      const startTimeMillis = parseInt(point.startTimeNanos) / 1000000;
      const endTimeMillis = parseInt(point.endTimeNanos) / 1000000;
      const durationHours = (endTimeMillis - startTimeMillis) / (1000 * 60 * 60);
      sleepHours += durationHours;
    });
    
    return {
      date: startDate.toISOString().split('T')[0],
      sleepHours: parseFloat(sleepHours.toFixed(2))
    };
  });
};

// Process heart rate data from Google Fit response
const processHeartRateData = (data: any) => {
  if (!data || !data.bucket) return [];

  return data.bucket.map((bucket: any) => {
    const startDate = new Date(parseInt(bucket.startTimeMillis));
    let heartRateValues: number[] = [];
    
    bucket.dataset[0]?.point?.forEach((point: any) => {
      point.value?.forEach((value: any) => {
        if (value.fpVal) {
          heartRateValues.push(value.fpVal);
        }
      });
    });
    
    // Calculate average heart rate
    const avgHeartRate = heartRateValues.length > 0 
      ? heartRateValues.reduce((sum, value) => sum + value, 0) / heartRateValues.length
      : 0;
    
    return {
      date: startDate.toISOString().split('T')[0],
      heartRate: parseFloat(avgHeartRate.toFixed(1))
    };
  });
};

// Fetch step data from Google Fit
export const fetchStepData = async (userId: string, startDate: Date, endDate: Date) => {
  try {
    const accessToken = await ensureValidToken(userId);
    if (!accessToken) {
      throw new Error('No valid access token available');
    }
    
    const body = {
      aggregateBy: [{
        dataTypeName: "com.google.step_count.delta",
        dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
      }],
      bucketByTime: { durationMillis: 86400000 }, // Group by day
      startTimeMillis: startDate.getTime(),
      endTimeMillis: endDate.getTime()
    };
    
    const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch step data: ${response.status}`);
    }
    
    const data = await response.json();
    return processStepData(data);
  } catch (error) {
    console.error("Error fetching step data:", error);
    toast.error("Falha ao buscar dados de passos");
    return [];
  }
};

// Fetch sleep data from Google Fit
export const fetchSleepData = async (userId: string, startDate: Date, endDate: Date) => {
  try {
    const accessToken = await ensureValidToken(userId);
    if (!accessToken) {
      throw new Error('No valid access token available');
    }
    
    const body = {
      aggregateBy: [{
        dataTypeName: "com.google.sleep.segment"
      }],
      bucketByTime: { durationMillis: 86400000 }, // Group by day
      startTimeMillis: startDate.getTime(),
      endTimeMillis: endDate.getTime()
    };
    
    const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sleep data: ${response.status}`);
    }
    
    const data = await response.json();
    return processSleepData(data);
  } catch (error) {
    console.error("Error fetching sleep data:", error);
    toast.error("Falha ao buscar dados de sono");
    return [];
  }
};

// Fetch heart rate data from Google Fit
export const fetchHeartRateData = async (userId: string, startDate: Date, endDate: Date) => {
  try {
    const accessToken = await ensureValidToken(userId);
    if (!accessToken) {
      throw new Error('No valid access token available');
    }
    
    const body = {
      aggregateBy: [{
        dataTypeName: "com.google.heart_rate.bpm"
      }],
      bucketByTime: { durationMillis: 86400000 }, // Group by day
      startTimeMillis: startDate.getTime(),
      endTimeMillis: endDate.getTime()
    };
    
    const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch heart rate data: ${response.status}`);
    }
    
    const data = await response.json();
    return processHeartRateData(data);
  } catch (error) {
    console.error("Error fetching heart rate data:", error);
    toast.error("Falha ao buscar dados de frequência cardíaca");
    return [];
  }
};

// Fetch all health data at once
export const fetchAllHealthData = async (userId: string, startDate: Date, endDate: Date) => {
  try {
    const steps = await fetchStepData(userId, startDate, endDate);
    const sleep = await fetchSleepData(userId, startDate, endDate);
    const heartRate = await fetchHeartRateData(userId, startDate, endDate);
    
    // Combine data by date
    const combinedData: Record<string, any> = {};
    
    [...steps, ...sleep, ...heartRate].forEach(item => {
      if (!combinedData[item.date]) {
        combinedData[item.date] = { date: item.date };
      }
      
      if ('steps' in item) combinedData[item.date].steps = item.steps;
      if ('sleepHours' in item) combinedData[item.date].sleepHours = item.sleepHours;
      if ('heartRate' in item) combinedData[item.date].heartRate = item.heartRate;
    });
    
    return Object.values(combinedData);
  } catch (error) {
    console.error("Error fetching all health data:", error);
    toast.error("Falha ao buscar dados de saúde");
    return [];
  }
};
