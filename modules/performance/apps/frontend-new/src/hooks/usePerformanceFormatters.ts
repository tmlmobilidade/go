'use client';

/* * */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export interface PerformanceFormatters {
	compact: (value: number) => string
	decimal: (value: number) => string
	fixedDecimal: (value: number) => string
	integer: (value: number) => string
	locale: string
	percentage: (value: number) => string
	ratio: (value: number) => string
	separators: {
		decimal: string
		group: string
	}
	signedCompact: (value: number) => string
	signedPercentage: (value: number) => string
	signedPercentagePoints: (value: number) => string
}

/* * */

export function resolvePerformanceLocale(language: string): string {
	return language.toLowerCase().startsWith('es') ? 'es-ES' : 'pt-PT';
}

function withSign(value: number, formattedValue: string) {
	return `${value > 0 ? '+' : ''}${formattedValue}`;
}

export function createPerformanceFormatters(locale: string): PerformanceFormatters {
	const compactFormatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, notation: 'compact' });
	const decimalFormatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
	const fixedDecimalFormatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
	const integerFormatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
	const ratioFormatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1, style: 'percent' });
	const numberParts = fixedDecimalFormatter.formatToParts(12345.5);
	const compact = (value: number) => compactFormatter.format(value);
	const fixedDecimal = (value: number) => fixedDecimalFormatter.format(value);

	return {
		compact,
		decimal: value => decimalFormatter.format(value),
		fixedDecimal,
		integer: value => integerFormatter.format(value),
		locale,
		percentage: value => `${fixedDecimal(value)}%`,
		ratio: value => ratioFormatter.format(value),
		separators: {
			decimal: numberParts.find(part => part.type === 'decimal')?.value ?? ',',
			group: numberParts.find(part => part.type === 'group')?.value ?? ' ',
		},
		signedCompact: value => withSign(value, compact(value)),
		signedPercentage: value => `${withSign(value, fixedDecimal(value))}%`,
		signedPercentagePoints: value => `${withSign(value, fixedDecimal(value))} p.p.`,
	};
}

/* * */

export function usePerformanceFormatters(): PerformanceFormatters {
	const { i18n } = useTranslation('default');
	const locale = resolvePerformanceLocale(i18n.language);

	return useMemo(() => createPerformanceFormatters(locale), [locale]);
}
