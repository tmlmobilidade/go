/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface OperationalDateTagProps {
	value: OperationalDateInt
}

/* * */

export function OperationalDateTag({ value }: OperationalDateTagProps) {
	//

	if (!value) {
		return <Tag label="N/A" variant="muted" />;
	}

	// const parsedOperationalDate = Dates
	// 	.fromOperationalDate(value, 'local')
	// 	.toFormat('yyyy-LL-dd');

	return <Tag label={value} variant="muted" />;

	//
}
