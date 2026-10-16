'use client';

import { createContext } from 'react';

import { type AnalyticsContextState } from '../types/shared/analytics';

/* * */

export const AnalyticsContext = createContext<AnalyticsContextState | undefined>(undefined);
