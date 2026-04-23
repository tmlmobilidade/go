'use client';

/* * */

import { type FormErrors, useForm, type UseFormReturnType } from '@mantine/form';
import { Logger } from '@tmlmobilidade/logger';
import { zodResolver } from 'mantine-form-zod-resolver';
import { type RefObject, useEffect, useRef } from 'react';
import { type Schema } from 'zod';

// import { usePreventNavigation } from './use-prevent-navigation';

/* * */

interface UseTypicalFormReturnType<T> {
	errors: FormErrors
	flags: {
		isDirty: boolean
		isValid: boolean
	}
	formRef: RefObject<UseFormReturnType<T>>
}

/**
 * A custom hook that sets up a typical form with validation and state management
 * using Mantine's useForm and Zod schema. It also handles form initialization with
 * API data and prevents navigation if the form is dirty.
 * @param schema The Zod schema to validate the form data.
 * @param apiData Optional initial data to populate the form.
 * @param initialValues Optional initial values to set when creating new forms.
 * @returns The current value of the CSS variable, or the default value or undefined if not set.
 */
export function useTypicalForm<T extends Record<string, unknown>>(
	schema: Schema,
	apiData?: null | T,
	initialValues?: Partial<T>,
	mode?: 'controlled' | 'uncontrolled',
): UseTypicalFormReturnType<T> {
	//

	//
	// Setup form and its related logic

	const formRef = useRef<UseFormReturnType<T>>(null);

	const form = useForm<T>({
		cascadeUpdates: true,
		initialValues: initialValues as T,
		mode: mode || 'uncontrolled',
		validate: zodResolver(schema as Schema<T>),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	// Assign synchronously so the effect below
	// always has the latest form methods

	formRef.current = form;

	//
	// Initialize form with API data

	useEffect(() => {
		// Skip if no API data
		if (!apiData) return;
		// Skip if form is dirty
		if (formRef.current.isDirty()) return;
		// Initialize form with API data
		formRef.current.reset();
		formRef.current.setValues(apiData);
		formRef.current.validate();
		formRef.current.resetDirty();
		Logger.success(`[${apiData._id}] Form initialized with values from API.`);
	}, [apiData]);

	//
	// Prevent navigation if form is dirty

	// usePreventNavigation(form.isDirty());

	//
	// Return hook values and functions
	// form.errors is React state inside useForm, so it's reactive.
	// form.isDirty() reads from reactive dirty-tracking state, also reactive.
	// Deriving these inline avoids stale state from useState/useEffect.

	return {
		errors: form.errors,
		flags: {
			isDirty: form.isDirty(),
			isValid: Object.keys(form.errors).length === 0,
		},
		formRef,
	};

	//
}
