/* * */

import { type ComboboxItem, type MultiSelectProps as MantineMultiSelectProps } from '@mantine/core';
import { type ClipboardEvent, useCallback, useMemo } from 'react';

/* * */

type MultiSelectData = MantineMultiSelectProps['data'];

function getValidValuesFromData(data: MultiSelectData): Set<string> {
	if (!data?.length) return new Set();

	const values = new Set<string>();

	for (const item of data) {
		if (typeof item === 'string') {
			values.add(item);
		} else if (item && typeof item === 'object' && 'group' in item && 'items' in item) {
			for (const sub of item.items) {
				values.add(typeof sub === 'string' ? sub : sub.value);
			}
		} else {
			values.add((item as ComboboxItem).value);
		}
	}

	return values;
}

interface UseMultiSelectPasteParams {
	data: MultiSelectData
	defaultValue?: string[]
	onChange?: (value: string[]) => void
	onPaste?: (event: ClipboardEvent<HTMLInputElement>) => void
	value?: string[]
}

/**
 * Handles comma-separated paste behavior for Mantine `MultiSelect`.
 * - Accepts comma-separated values from clipboard
 * - Filters out values that do not exist in `data`
 * - Merges valid values with the current selection (no duplicates)
 */
export function useMultiSelectPaste({
	data,
	defaultValue,
	onChange,
	onPaste,
	value,
}: UseMultiSelectPasteParams) {
	const validValues = useMemo(() => getValidValuesFromData(data), [data]);

	const handlePaste = useCallback(
		(event: ClipboardEvent<HTMLInputElement>) => {
			const text = event.clipboardData.getData('text');

			const pasted = text
				.split(',')
				.map(s => s.trim())
				.filter(Boolean);

			if (pasted.length === 0) {
				onPaste?.(event);
				return;
			}

			const toAdd = pasted.filter(v => validValues.has(v));

			if (toAdd.length === 0) {
				onPaste?.(event);
				return;
			}

			event.preventDefault();

			const current = value ?? defaultValue ?? [];
			const merged = Array.from(new Set([...current, ...toAdd]));

			onChange?.(merged);
			onPaste?.(event);
		},
		[defaultValue, onChange, onPaste, validValues, value],
	);

	return handlePaste;
}
