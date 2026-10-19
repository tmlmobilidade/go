/* * */

import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { useMemo } from 'react';

import { Tag } from '../../components/tags';

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
