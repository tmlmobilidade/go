/* * */

import { Dates } from '@tmlmobilidade/dates';
import { getCurrentEnvironment } from '@tmlmobilidade/types';

/* * */

export function getEarliestDate(): Dates {
	if (getCurrentEnvironment() === 'production') return Dates.fromOperationalDate('20240101', 'Europe/Lisbon');
	else return Dates.now('Europe/Lisbon').minus({ weeks: 1 });
};
