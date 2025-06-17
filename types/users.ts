export interface UserPreferences {
  darkMode: boolean;
  language: string;
  measurementSystem: 'metric' | 'imperial';
  dateFormat: '12h' | '24h';
  notifications: boolean;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  preferences: UserPreferences;
}