/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';

import { Tag } from '../../components/tags';

/* * */

interface UnixTimestampDisplayProps {
	value: UnixTimestamp
}

/* * */

export function UnixTimestampDisplay({ value }: UnixTimestampDisplayProps) {
	//

	const unixTimestampDisplayValue = useMemo(() => {
		if (!value) return null;
		return Dates
			.fromUnixTimestamp(value)
			.toFormat('yyyy-LL-dd HH:mm:ss');
	}, [value]);

	if (!unixTimestampDisplayValue) return;

	return <Tag label={unixTimestampDisplayValue} variant="muted" />;
}
