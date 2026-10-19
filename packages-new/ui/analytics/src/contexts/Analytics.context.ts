'use client';

import { createContext } from 'react';

import { type AnalyticsContextState } from '../types/analytics';

/* * */

export const AnalyticsContext = createContext<AnalyticsContextState | undefined>(undefined);
