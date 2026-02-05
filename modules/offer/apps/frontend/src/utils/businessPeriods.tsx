import { IconMoon, IconSun, IconSunset } from '@tabler/icons-react';
import { JSX } from 'react';

/* * */

export type PeriodKey = 'cd' | 'm' | 'n' | 'ppm' | 'ppt';

/* * */

export interface BusinessPeriod {
	icon: JSX.Element
	key: PeriodKey
	title: string
}

/* * */

export const BUSINESS_PERIODS: BusinessPeriod[] = [
	{ icon: <IconSun size={14} />, key: 'ppm', title: 'PPM — Período de ponta da manhã (06:00 - 09:59)' },
	{ icon: <IconSun size={14} style={{ opacity: 0.7 }} />, key: 'cd', title: 'CD — Corpo do Dia (10:00 - 15:59)' },
	{ icon: <IconSunset size={14} style={{ opacity: 0.7 }} />, key: 'ppt', title: 'PPT — Período de ponta da tarde (16:00 - 19:59)' },
	{ icon: <IconMoon size={14} />, key: 'n', title: 'N — Noite (20:00 - 23:59)' },
	{ icon: <IconMoon size={14} style={{ opacity: 0.7 }} />, key: 'm', title: 'M — Madrugada (00:00 - 05:59)' },
];

/* * */

export function getPeriodForTime(time: string): PeriodKey {
	const hour = parseInt(time.split(':')[0], 10);
	if (hour >= 6 && hour < 10) return 'ppm';
	if (hour >= 10 && hour < 16) return 'cd';
	if (hour >= 16 && hour < 20) return 'ppt';
	if (hour >= 20) return 'n';
	return 'm';
}

/* * */

export function groupTimesByPeriod(times: string[]): Record<PeriodKey, string[]> {
	return BUSINESS_PERIODS.reduce<Record<PeriodKey, string[]>>((acc, p) => {
		acc[p.key] = times.filter(t => getPeriodForTime(t) === p.key);
		return acc;
	}, { cd: [], m: [], n: [], ppm: [], ppt: [] });
}
