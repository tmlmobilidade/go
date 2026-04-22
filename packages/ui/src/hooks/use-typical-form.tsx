'use client';

/* * */

import { type FormErrors, useForm, type UseFormReturnType } from '@mantine/form';
import { Logger } from '@tmlmobilidade/logger';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useEffect, useState } from 'react';
import { type Schema } from 'zod';

// import { usePreventNavigation } from './use-prevent-navigation';

/* * */

interface UseTypicalFormReturnType<T> {
	errors: FormErrors
	flags: {
		isDirty: boolean
		isValid: boolean
	}
	form: UseFormReturnType<T>
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

	const form = useForm<T>({
		cascadeUpdates: true,
		initialValues: initialValues as T,
		mode: mode || 'uncontrolled',
		validate: zodResolver(schema as Schema<T>),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// Initialize form with API data

	useEffect(() => {
		// Skip if no API data
		if (!apiData) return;
		// Skip if form is dirty
		if (form.isDirty()) return;
		// Initialize form with API data
		form.reset();
		form.setValues(apiData);
		form.validate();
		form.resetDirty();
		Logger.success(`[${apiData._id}] Form initialized with values from API.`);
	}, [apiData]);

	//
	// Prevent navigation if form is dirty

	// usePreventNavigation(form.isDirty());

	//
	// Return hook values and functions

	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [isValid, setIsValid] = useState<boolean>(false);
	const [formErrors, setFormErrors] = useState<FormErrors>({});

	useEffect(() => {
		setFormErrors(form.errors);
		setIsDirty(form.isDirty());
		setIsValid(form.isValid());
	}, [form]);

	//
	// Return hook values and functions

	return {
		errors: formErrors,
		flags: {
			isDirty: isDirty,
			isValid: isValid,
		},
		form,
	};

	//
}
