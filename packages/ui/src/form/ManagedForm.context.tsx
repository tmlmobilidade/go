'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import { type DefaultValues, useForm, type UseFormReturn } from 'react-hook-form';
import { type ZodSchema } from 'zod';

import { usePreventNavigation } from '../hooks/use-prevent-navigation';

/* * */

interface UseManagedFormContextReturnType<T = any> {
	form: UseFormReturn<T>
	unblock: () => void
}

interface ManagedFormContextProviderProps<T> {
	apiData?: null | T
	defaultValues: DefaultValues<T>
	schema: ZodSchema
}

/* * */

const ManagedFormContext = createContext<undefined | UseManagedFormContextReturnType>(undefined);

export const useManagedFormContext = () => {
	const context = useContext(ManagedFormContext);
	if (!context) {
		throw new Error('useManagedFormContext must be used within a ManagedFormContextProvider');
	}
	return context;
};

/* * */

export function ManagedFormContextProvider<T>({ apiData, children, defaultValues, schema }: PropsWithChildren<ManagedFormContextProviderProps<T>>) {
	//

	//
	// Setup form and its related logic

	const form = useForm<T>({
		defaultValues,
		resolver: schema ? zodResolver(schema) : undefined,
	});

	const isFormDirty = useMemo(() => {
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
		if (!apiData) return;
		if (isFormDirty) return;
		form.reset(apiData);
	}, [apiData, form, isFormDirty]);

	//
	// Prevent navigation if form is dirty

	const unblock = usePreventNavigation(isFormDirty);

	//
	// Return context value

	return (
		<ManagedFormContext.Provider value={{ form, unblock }}>
			{children}
		</ManagedFormContext.Provider>
	);
}
