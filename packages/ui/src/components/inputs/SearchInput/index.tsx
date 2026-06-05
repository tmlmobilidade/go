'use client';

import { Input, TextInput as MantineTextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

/* * */

export interface SearchInputProps {
	onChange: (value: string) => void
	placeholder?: string
	size?: 'sm' | 'xl'
	value?: null | string
}

/* * */

export function SearchInput({ onChange, placeholder = 'Pesquisar...', size = 'sm', value }: SearchInputProps) {
	//

	//
	// A. Handle actions

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!onChange) return;
		onChange(event.target.value);
	};

	const handleClear = () => {
		if (!onChange) return;
		onChange('');
	};

	//
	// B. Render components

	return (
		<MantineTextInput
			leftSection={<IconSearch size={size === 'xl' ? 28 : 20} />}
			onChange={handleChange}
			placeholder={placeholder}
			rightSection={value?.length && <Input.ClearButton onClick={handleClear} />}
			size={size}
			value={value ?? ''}
			w="100%"
		/>
	);

	//
}
