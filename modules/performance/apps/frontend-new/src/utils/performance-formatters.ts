/* * */

export type PerformanceNumberFormat = 'compact' | 'decimal' | 'fixed-decimal' | 'integer' | 'percentage' | 'percentage-points' | 'ratio';
export type PerformanceValueFormat = 'clock-minutes' | 'duration-minutes' | 'operational-date' | PerformanceNumberFormat;

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
}

interface FormatPerformanceValueOptions {
	signed?: boolean
	suffix?: string
}

/* * */

export function resolvePerformanceLocale(language: string): string {
	return language.toLowerCase().startsWith('es') ? 'es-ES' : 'pt-PT';
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
	};
}

export function formatPerformanceValue(value: number, format: PerformanceValueFormat, formatters: PerformanceFormatters, { signed = false, suffix = '' }: FormatPerformanceValueOptions = {}): string {
	let formattedValue: string;

	if (format === 'clock-minutes') {
		const minute = ((Math.round(value) % 1440) + 1440) % 1440;
		formattedValue = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
	} else if (format === 'duration-minutes') {
		const minute = Math.round(value);
		formattedValue = `${Math.floor(minute / 60)}h${String(minute % 60).padStart(2, '0')}`;
	} else if (format === 'operational-date') {
		const raw = String(Math.trunc(value));
		formattedValue = new Intl.DateTimeFormat(formatters.locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}T12:00:00Z`));
	} else {
		formattedValue = {
			'compact': formatters.compact,
			'decimal': formatters.decimal,
			'fixed-decimal': formatters.fixedDecimal,
			'integer': formatters.integer,
			'percentage': formatters.percentage,
			'percentage-points': number => `${formatters.fixedDecimal(number)} p.p.`,
			'ratio': formatters.ratio,
		}[format](value);
	}

	return `${signed && value > 0 ? '+' : ''}${formattedValue}${suffix}`;
}
