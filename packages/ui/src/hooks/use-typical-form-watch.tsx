'use client';

/* * */

import { type UseFormReturnType } from '@mantine/form';
import { type DotPath, getValueAtPath, type PathValue } from '@tmlmobilidade/utils';
import { useEffect, useState } from 'react';

const POLL_INTERVAL_MS = 100;

export function useTypicalFormWatch<T, const P extends DotPath<T>>(form: UseFormReturnType<T>, fields: P[]): { [K in P]: PathValue<T, K> } {
	//

	//
	// A. Setup variables

	const [watchedValues, setWatchedValues] = useState<{ [K in P]: PathValue<T, K> }>(() => {
		const values = form.getValues();
		const entries = fields.map(field => [field, getValueAtPath(values, field)]);
		return Object.fromEntries(entries) as { [K in P]: PathValue<T, K> };
	});

	// () => {
	// 	const values = form.getValues();
	// 	const entries = fields.map(field => [field, getValueAtPath(values, field)]);
	// 	return Object.fromEntries(entries) as { [K in P]: PathValue<T, K> };
	// }

	//
	// B. Handle actions

	const updateWatchedValues = () => {
		const latestValues = form.getValues();
		const entries = fields.map(field => [field, getValueAtPath(latestValues, field)]);
		const next = Object.fromEntries(entries) as { [K in P]: PathValue<T, K> };
		setWatchedValues((prev) => {
			const changed = fields.some(field => prev[field as P] !== next[field as P]);
			return changed ? next : prev;
		});
	};

	useEffect(() => {
		updateWatchedValues();
		const interval = setInterval(updateWatchedValues, POLL_INTERVAL_MS);
		return () => clearInterval(interval);
	}, []);

	//
	// C. Render components

	return watchedValues;

	//
}
