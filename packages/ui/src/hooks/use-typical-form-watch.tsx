'use client';

/* * */

import { type UseFormReturnType } from '@mantine/form';
import { type DotPath, getValueAtPath, type PathValue } from '@tmlmobilidade/utils';
import { useCallback, useEffect, useState } from 'react';

/**
 * A hook to watch specific fields in a Mantine form and return their current values.
 * This hook uses polling to check for changes in the specified fields and updates
 * the returned values accordingly. It is useful for scenarios where you need to
 * react to changes in form fields without causing re-renders on every change.
 * @param form The Mantine form object to watch.
 * @param fields An array of field paths to watch for changes. The paths can be nested using dot notation.
 * @returns An object containing the current values of the watched fields, keyed by their paths.
 */
export function useTypicalFormWatch<T, const P extends DotPath<T>>(form: UseFormReturnType<T>, fields: P[]): { [K in P]: PathValue<T, K> } {
	//

	//
	// A. Setup variables

	const [watchedValues, setWatchedValues] = useState<{ [K in P]: PathValue<T, K> }>(() => {
		const values = form.getValues();
		const entries = fields.map(field => [field, getValueAtPath(values, field)]);
		return Object.fromEntries(entries) as { [K in P]: PathValue<T, K> };
	});

	//
	// B. Handle actions

	const updateWatchedValues = useCallback(() => {
		const latestValues = form.getValues();
		const entries = fields.map(field => [field, getValueAtPath(latestValues, field)]);
		const next = Object.fromEntries(entries) as { [K in P]: PathValue<T, K> };
		setWatchedValues((prev) => {
			const changed = fields.some(field => prev[field as P] !== next[field as P]);
			return changed ? next : prev;
		});
	}, [fields, form]);

	useEffect(() => {
		updateWatchedValues();
		const interval = setInterval(updateWatchedValues, 100);
		return () => clearInterval(interval);
	}, [updateWatchedValues]);

	//
	// C. Render components

	return watchedValues;

	//
}
