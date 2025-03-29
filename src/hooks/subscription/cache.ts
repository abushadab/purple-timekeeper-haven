
import { Subscription } from "./types";
import { parseSubscriptionData } from "./utils";

const CACHE_KEY = 'subscription_data';
const CACHE_TIME_KEY = 'subscription_data_time';
const CACHE_MAX_AGE = 30000; // 30 seconds

export const saveSubscriptionToCache = (data: any): void => {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
};

export const clearSubscriptionCache = (): void => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);
};

export const getSubscriptionFromCache = (): {
  subscription: Subscription | null;
  isCacheValid: boolean;
} => {
  const cachedData = localStorage.getItem(CACHE_KEY);
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
  const now = Date.now();
  
  if (!cachedData || !cachedTime) {
    return { subscription: null, isCacheValid: false };
  }
  
  const cacheAge = now - parseInt(cachedTime);
  const isCacheValid = cacheAge < CACHE_MAX_AGE;
  
  if (!isCacheValid) {
    return { subscription: null, isCacheValid: false };
  }
  
  try {
    const data = JSON.parse(cachedData);
    return { 
      subscription: parseSubscriptionData(data),
      isCacheValid: true
    };
  } catch (error) {
    console.error('Error parsing cached subscription data:', error);
    clearSubscriptionCache();
    return { subscription: null, isCacheValid: false };
  }
};

