'use client';

import { useEffect, useState } from 'react';

import { getCssVariableValue } from '../utils/get-variable-value';

/**
 * A custom hook to read and keep track of a CSS variable's value.
 * @param variableName The name of the CSS variable to read.
 * @param defaultValue The default value to use if the variable is not set.
 * @param refreshRate The rate at which to refresh the variable's value. Defaults to `100` ms.
 * @returns The current value of the CSS variable, or the default value or undefined if not set.
 */
export function useCssVariable(variableName: string, defaultValue?: string, refreshRate?: number): string | undefined {
	//

	//
	// A. Setup variables

	const [variableValue, setVariableValue] = useState<string | undefined>(defaultValue);

	//
	// B. Handle actions

	const updateVariableValue = () => {
		const value = getCssVariableValue(variableName);
		setVariableValue(value);
	};

	useEffect(() => {
		updateVariableValue();
		const interval = setInterval(updateVariableValue, refreshRate ?? 100);
		return () => clearInterval(interval);
	}, []);

	//
	// C. Render components

	return variableValue;

	//
}
