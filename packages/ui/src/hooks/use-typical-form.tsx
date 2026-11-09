'use client';

import { type FormErrors, useForm, type UseFormReturnType } from '@mantine/form';
import { createValidationResolver } from '@tmlmobilidade/go-utils-validation';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { type ZodType } from 'zod';

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
	schema: ZodType,
	apiData?: null | T | undefined,
	initialValues?: Partial<T>,
	mode?: 'controlled' | 'uncontrolled',
): UseTypicalFormReturnType<T> {
	//

	//
	// Setup form and its related logic

	const { i18n } = useTranslation();
	const locale = i18n.resolvedLanguage ?? i18n.language;
	const previousLocale = useRef(locale);

	const form = useForm<T>({
		cascadeUpdates: true,
		initialValues: initialValues as T,
		mode: mode || 'uncontrolled',
		validate: createValidationResolver(schema, locale),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	useEffect(() => {
		if (previousLocale.current === locale) return;
		previousLocale.current = locale;
		const fields = Object.keys(form.errors);
		if (!fields.length) return;
		const errors = createValidationResolver(schema, locale)(form.getValues());
		form.setErrors(Object.fromEntries(fields.filter(field => errors[field]).map(field => [field, errors[field]])));
	}, [locale, form, schema]);

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
		console.info(`[${apiData._id}] Form initialized with values from API.`);
	}, [apiData]);

	//
	// Prevent navigation if form is dirty

	// usePreventNavigation(form.isDirty());

	//
	// Return hook values and functions

	return {
		errors: form.errors,
		flags: {
			isDirty: form.isDirty(),
			isValid: form.isValid(),
		},
		form,
	};

	//
}
