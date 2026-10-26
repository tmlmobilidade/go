'use client';

import { Input, TextInput as MantineTextInput, type TextInputProps as MantineTextInputProps } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { forwardRef, type ReactNode } from 'react';

/* * */

export interface SearchInputProps extends Omit<MantineTextInputProps, 'onChange' | 'rightSection' | 'type' | 'value'> {
	clearButton?: (onClear: () => void) => ReactNode
	onChange: (value: string) => void
	value: string
}

/* * */

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput({ clearButton, onChange, value, ...props }, ref) {
	//

	//
	// A. Handle actions

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onChange(event.currentTarget.value);
	};

	const handleClear = () => {
		onChange('');
	};

	const clearButtonElement = value.length > 0
		? clearButton?.(handleClear) ?? <Input.ClearButton onClick={handleClear} />
		: undefined;

	//
	// B. Render components

	return (
		<MantineTextInput
			ref={ref}
			enterKeyHint="search"
			inputMode="search"
			leftSection={<IconSearch size={20} />}
			onChange={handleChange}
			rightSection={clearButtonElement}
			rightSectionPointerEvents={clearButtonElement ? 'all' : undefined}
			value={value}
			{...props}
		/>
	);

	//
});
