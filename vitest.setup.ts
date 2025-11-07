import { vi } from 'vitest';
import React from 'react';

// Mock React Native modules for Node.js test environment
vi.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: vi.fn((obj) => obj.web),
  },
  AppState: {
    currentState: 'active',
    addEventListener: vi.fn(() => ({
      remove: vi.fn(),
    })),
  },
}));

// Mock performance.now() if not available
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
  } as Performance;
}

// Mock document for web platform checks
if (typeof document === 'undefined') {
  global.document = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as Document;
}

// Ensure React is available globally for Zustand hooks
global.React = React;

