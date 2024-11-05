'use client';

import { createContext } from 'react';

/**
 * Context for managing refresh state across components
 * @type {React.Context}
 */
export const RefreshContext = createContext();

/**
 * Context for sharing state between components
 * @type {React.Context}
 */
export const SharedContext = createContext(); 