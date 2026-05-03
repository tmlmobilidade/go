'use client';

/* * */

import { zodResolver } from '@hookform/resolvers/zod';
import { Logger } from '@tmlmobilidade/logger';
import { useEffect } from 'react';
import { DefaultValues, useForm, type UseFormReturn } from 'react-hook-form';
import { type ZodSchema } from 'zod';

import { usePreventNavigation } from './use-prevent-navigation';

/* * */

interface UseContextFormProps<T> {
	apiData?: null | T
	defaultValues?: DefaultValues<T>
	mode?: 'controlled' | 'uncontrolled'
	schema?: ZodSchema<T>
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
export function useContextForm<T>({ apiData, defaultValues, schema }: UseContextFormProps<T>): UseFormReturn<T> {
	//

	//
	// Setup form and its related logic

	const form = useForm<T>({
		defaultValues: defaultValues,
		// resolver: zodResolver(schema),
	});

	//
	// Initialize form with API data

	useEffect(() => {
		// Skip if no API data
		if (!apiData) return;
		// Skip if form is dirty
		if (form.formState.isDirty) return;
		// Initialize form with API data
		form.reset(apiData);
		Logger.success(`Form initialized with values from API.`);
	}, [apiData, form]);

	//
	// Prevent navigation if form is dirty

	usePreventNavigation(form.formState.isDirty);

	//
	// Return hook values and functions
	// form.errors is React state inside useForm, so it's reactive.
	// form.isDirty() reads from reactive dirty-tracking state, also reactive.
	// Deriving these inline avoids stale state from useState/useEffect.

	return form;

	//
}
