/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface OperationalDateDisplayProps {
	value: OperationalDateInt
}

/* * */

export function OperationalDateDisplay({ value }: OperationalDateDisplayProps) {
	//

	const operationalDateValue = useMemo(() => {
		if (!value) return null;
		return Dates
			.fromOperationalDateInt(value, 'local')
			.toFormat('yyyy-LL-dd');
	}, [value]);

	if (!operationalDateValue) return;

	return <Tag label={operationalDateValue} variant="muted" />;
}
