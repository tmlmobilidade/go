import { z } from 'zod';

export const BusinessPeriodsValues = ['CD', 'M', 'N', 'PPM', 'PPT'] as const;
export const BusinessPeriodSchema = z.enum(BusinessPeriodsValues);

export type BusinessPeriod = z.infer<typeof BusinessPeriodSchema>;

export const BUSINESS_PERIOD_LABELS: Record<BusinessPeriod, { long: string, short: string, short_with_time?: string }> = {
	CD: { long: 'Corpo do Dia', short: 'CD', short_with_time: 'CD (10:00 - 15:59)' },
	M: { long: 'Madrugada', short: 'M', short_with_time: 'M (00:00 - 05:59)' },
	N: { long: 'Noite', short: 'N', short_with_time: 'N (20:00 - 23:59)' },
	PPM: { long: 'Período de ponta da manhã', short: 'PPM', short_with_time: 'PPM (06:00 - 09:59)' },
	PPT: { long: 'Período de ponta da tarde', short: 'PPT', short_with_time: 'PPT (16:00 - 19:59)' },
};
