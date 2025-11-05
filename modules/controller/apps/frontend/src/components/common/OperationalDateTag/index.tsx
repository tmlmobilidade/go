/* * */

import { Tag } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/dates';
import { type RideNorma@tmlmobilidade/datestmlmobilidade/sae-controller-pckg-ride-normalized';

/* * */

interface OperationalDateTagProps {
	value: RideNormalized['operational_date']
}

/* * */

export function OperationalDateTag({ value }: OperationalDateTagProps) {
	//

	if (!value) {
		return <Tag label="N/A" variant="muted" />;
	}

	const parsedOperationalDate = Dates
		.fromOperationalDate(value, 'Europe/Lisbon')
		.toFormat('yyyy-LL-dd');

	return <Tag label={parsedOperationalDate} variant="muted" />;

	//
}
