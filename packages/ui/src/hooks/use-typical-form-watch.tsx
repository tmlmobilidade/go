'use client';

/* * */

import { type LooseKeys, type UseFormReturnType } from '@mantine/form';
import { type DotPath, getValueAtPath, type PathValue } from '@tmlmobilidade/utils';
import { useState } from 'react';

/**
 * A custom React hook that watches specific fields in a form and returns their current values.
 * It uses the `getValueAtPath` utility to retrieve values from the form's state based on dot-separated paths.
 * The hook sets up watchers for each specified field and updates the returned values whenever any of the fields change.
 * @param form The form object returned by `useForm` from Mantine, which contains the form state and methods.
 * @param fields An array of dot-separated paths representing the fields to watch in the form. These paths can point to nested fields within the form's state.
 * @returns An object where each key is a field path from the `fields` array and the value is the current value of that field in the form's state.
 */
export function useTypicalFormWatch<T, const P extends DotPath<T>>(form: UseFormReturnType<T>, fields: P[]): { [K in P]: PathValue<T, K> } {
	//

	const initialValues = form.getValues();

	const [result, setResult] = useState(() => {
		const watchedEntries = fields.map(field => [field, getValueAtPath(initialValues, field)]);
		return Object.fromEntries(watchedEntries) as { [K in P]: PathValue<T, K> };
	});

	for (const field of fields) {
		(form.watch as (path: LooseKeys<T>, subscriber: (input: { value: unknown }) => void) => void)(field, ({ value }) => {
			setResult(previous => ({ ...previous, [field]: value }));
		});
	}

	return result as { [K in P]: PathValue<T, K> };
}
