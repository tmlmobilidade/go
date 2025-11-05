/* * */

import { type RideNormalized } from '@tmlmobilidade/sae-controller-pckg-ride-normalized';
import { Tag } from '@tmlmobilidade/ui';
import { Dates } from '@go/utils-dates';

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
