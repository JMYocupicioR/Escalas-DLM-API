// Jest setup file
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    },
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock AsyncStorage for Jest environment
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  // Minimal theme objects used by app/theme.ts
  DefaultTheme: { colors: { primary: '#1d4ed8', background: '#ffffff', card: '#f8fafc', text: '#0f172a', border: '#e5e7eb', notification: '#ef4444' } },
  DarkTheme: { colors: { primary: '#93c5fd', background: '#0f172a', card: '#111827', text: '#f9fafb', border: '#374151', notification: '#fca5a5' } },
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    rpc: jest.fn(),
    functions: {
      invoke: jest.fn(),
    },
  })),
}));

// Mock Animated from react-native
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock jsPDF to avoid binary/encoding issues in Jest
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
    setFontSize: jest.fn(),
    text: jest.fn(),
    setLineWidth: jest.fn(),
    rect: jest.fn(),
  }));
});

// Silence Animated warnings: the RN helper path may vary across versions; omit direct mock

// Mock fetch
global.fetch = jest.fn();

// Console warning suppression for tests
const originalWarn = console.warn;
beforeEach(() => {
  jest.useFakeTimers();
});
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});

afterEach(() => {
  try {
    jest.runOnlyPendingTimers();
  } catch {}
  jest.useRealTimers();
});
