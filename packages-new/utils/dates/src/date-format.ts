/* * */

import { type DateFormat } from '@tmlmobilidade/go-types-shared';

/* * */

export interface DateFormatConfig {
	day?: '2-digit' | 'numeric'
	hour?: '2-digit' | 'numeric'
	minute?: '2-digit' | 'numeric'
	month?: '2-digit' | 'long' | 'numeric' | 'short'
	second?: '2-digit' | 'numeric'
	timeZoneName?: 'long' | 'short'
	weekday?: 'long' | 'narrow' | 'short'
	year?: '2-digit' | 'numeric'
}

/**
 * A map of date formats to their corresponding config.
 */
export const DateFormatConfigMap: Record<DateFormat, DateFormatConfig> = {
	full: {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	},
	iso: {
		day: 'numeric',
		month: 'numeric',
		year: 'numeric',
	},
	only_date: {
		day: 'numeric',
		month: 'numeric',
		year: 'numeric',
	},
	only_time: {
		hour: 'numeric',
		minute: 'numeric',
	},
	only_time_with_seconds: {
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
	},
	short: {
		day: 'numeric',
		month: 'numeric',
		year: 'numeric',
	},
};
