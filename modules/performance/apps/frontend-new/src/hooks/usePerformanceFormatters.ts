'use client';

/* * */

import { createPerformanceFormatters, type PerformanceFormatters, resolvePerformanceLocale } from '@/utils/performance-formatters';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function usePerformanceFormatters(): PerformanceFormatters {
	const { i18n } = useTranslation('default');
	const locale = resolvePerformanceLocale(i18n.language);

	return useMemo(() => createPerformanceFormatters(locale), [locale]);
}
