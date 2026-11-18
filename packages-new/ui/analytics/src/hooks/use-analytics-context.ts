'use client';

import { useContext } from 'react';

import { AnalyticsContext } from '../contexts/Analytics.context.js';
import { type AnalyticsContextState } from '../types/analytics.js';

/* * */

export function useAnalyticsContext(): AnalyticsContextState {
	const context = useContext(AnalyticsContext);

	if (!context) {
		throw new Error('useAnalyticsContext must be used within an AnalyticsContextProvider');
	}

	return context;
}
