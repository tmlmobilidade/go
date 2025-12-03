'use client';

/* * */

import { type FormErrors, useForm, UseFormReturnType } from '@mantine/form';
import { useDebouncedCallback } from '@mantine/hooks';
import { Logger } from '@tmlmobilidade/logger';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useEffect, useState } from 'react';
import { type Schema } from 'zod';

import { usePreventNavigation } from './use-prevent-navigation';

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
 * A custom hook to read and keep track of a CSS variable's value.
 * @param variableName The name of the CSS variable to read.
 * @param defaultValue The default value to use if the variable is not set.
 * @param refreshRate The rate at which to refresh the variable's value. Defaults to `100` ms.
 * @returns The current value of the CSS variable, or the default value or undefined if not set.
 */
export function useTypicalForm<T extends Record<string, unknown>>(schema: Schema, apiData?: null | T | undefined): UseTypicalFormReturnType<T> {
	//

	//
	// A. Setup variables

	const [formErrors, setFormErrors] = useState<FormErrors>({});

	//
	// B. Handle actions

	const validateForm = useDebouncedCallback(() => {
		const validationResult = form.validate();
		setFormErrors(validationResult.errors);
		console.log('Form validation result:', validationResult);
	}, 750);

	const form = useForm<T>({
		mode: 'uncontrolled',
		onValuesChange: validateForm,
		validate: zodResolver(schema),
		validateInputOnBlur: false,
		validateInputOnChange: false,
	});

	useEffect(() => {
		// Skip if no API data
		if (!apiData) return;
		// Skip if form is dirty
		if (form.isDirty()) return;
		// Initialize form with API data
		form.reset();
		form.setValues(apiData);
		form.resetDirty();
		Logger.success(`[${apiData._id}] Form initialized with values from API.`);
	}, [apiData]);

	// const iuhdiush = usePreventNavigation(form.isDirty());

	// useEffect(() => {
	// 	// Setup before unload listener to warn user about unsaved changes
	// 	const handleBeforeUnload = (event: BeforeUnloadEvent) => {
	// 		event.preventDefault();
	// 		event.returnValue = '';
	// 	};
	// 	// Add or remove listener based on form dirty state
	// 	if (form.isDirty()) window.addEventListener('beforeunload', handleBeforeUnload);
	// 	else window.removeEventListener('beforeunload', handleBeforeUnload);
	// 	// Cleanup listener on unmount
	// 	return () => {
	// 		window.removeEventListener('beforeunload', handleBeforeUnload);
	// 	};
	// }, [form.isDirty()]);

	//
	// C. Render components

	return {
		errors: formErrors,
		flags: {
			isDirty: form.isDirty(),
			isValid: form.isValid(),
		},
		form,
	};

	//
}
