'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { type DefaultValues, useForm, type UseFormReturn } from 'react-hook-form';
import { z, type ZodType } from 'zod';

import { usePreventNavigation } from '../../hooks/use-prevent-navigation';

/* * */

// interface UseStandardFormProps<T> {
// 	apiData?: null | T
// 	defaultValues?: DefaultValues<T>
// 	mode?: 'controlled' | 'uncontrolled'
// 	schema?: ZodSchema<T>
// }

interface UseStandardFormProps<T, TSchema extends ZodType> {
	apiData?: null | T
	defaultValues?: DefaultValues<T>
	mode?: 'controlled' | 'uncontrolled'
	schema?: TSchema
}

export interface UseStandardFormReturnType<T> {
	form: UseFormReturn<T>
	isDirty: boolean
	unblock: () => void
}

/**
 * A custom hook that sets up a context form with validation
 * and state management using Mantine's useForm and Zod schema.
 * It also handles form initialization with API data and prevents
 * navigation if the form is dirty.
 * @param schema The Zod schema to validate the form data.
 * @param apiData Optional initial data to populate the form.
 * @param defaultValues Optional initial values to set when creating new forms.
 * @returns The form methods and state from React Hook Form.
 */
export function useStandardForm<T, TSchema extends ZodType>({ apiData, defaultValues, schema }: UseStandardFormProps<T, TSchema>): UseStandardFormReturnType<T> {
	//

	//
	// Setup form and its related logic

	const form = useForm<z.input<TSchema>>({
		defaultValues,
		resolver: schema ? zodResolver(schema) : undefined,
	});

	const isDirty = useMemo(() => {
		// This is necessary due to a mismatch between isDirty flag and dirtyFields
		// in React Hook Form. isDirty is a boolean that indicates if any field is dirty,
		// while dirtyFields is an object that tracks which specific fields are dirty.
		// In some cases isDirty may not update correctly, while dirtyFields will still track changes.
		// Therefore, we check the length of the keys in dirtyFields to determine if the form is dirty.
		// More here: https://github.com/react-hook-form/react-hook-form/pull/13162
		return Object.keys(form.formState.dirtyFields).length > 0;
	}, [form.formState.dirtyFields]);

	//
	// Initialize form with API data

	useEffect(() => {
		// Skip if no API data
		if (!apiData) return;
		// Skip if form is dirty
		if (isDirty) return;
		// Initialize form with API data
		form.reset(apiData);
		// eslint-disable-next-line no-console
		console.info(`Form initialized with values from API.`);
	}, [apiData, form, isDirty]);

	//
	// Prevent navigation if form is dirty

	const unblock = usePreventNavigation(false); // (isDirty);

	//
	// Return hook values and functions

	return { form, isDirty, unblock };
}
