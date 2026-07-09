'use client';

export const DEFAULT_LOCALE_CODE = 'pt';

/* * */

export interface LocaleConfig {
	_id: string
	alias: string[]
	enabled: boolean
	name: string
}

export const availableLocales: LocaleConfig[] = [
	{
		_id: 'pt',
		alias: ['pt-PT', 'pt_PT', 'pt-BR', 'pt_BR', 'pt-GW', 'pt_GW', 'pt-MZ', 'pt_MZ'],
		enabled: true,
		name: 'Português',
	},
	{
		_id: 'es',
		alias: ['es-ES', 'es_ES', 'es-MX', 'es_MX', 'es-AR', 'es_AR'],
		enabled: true,
		name: 'Español',
	},
];

/* * */

export const enabledLocales = availableLocales.filter(item => item.enabled);
export const enabledLocaleCodes = enabledLocales.map(item => item._id);
export const allEnabledLocaleCodesAndAliases = enabledLocales.reduce((acc, item) => [...acc, item._id, ...item.alias], []);

export const defaultLocale = availableLocales.find(item => item._id === DEFAULT_LOCALE_CODE);

/* * */

export function getMatchingLocale(localeCode: string) {
	const matchingLocale = enabledLocales.find(item => item._id === localeCode || item.alias.includes(localeCode));
	if (matchingLocale) return matchingLocale;
	else return null;
}
