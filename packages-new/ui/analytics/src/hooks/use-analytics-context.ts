'use client';

import { useContext } from 'react';

import { AnalyticsContext } from '../contexts/Analytics.context.js';

/* * */

export function useAnalyticsContext() {
	const context = useContext(AnalyticsContext);
	if (!context) {
		throw new Error('useAnalyticsContext must be used within an AnalyticsContextProvider');
	}
	return context;
}
