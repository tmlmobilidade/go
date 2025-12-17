'use client';

/* * */

import { ActionIcon as MantineActionIcon, TextInput as MantineTextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export interface SearchInputProps {
	onChange: (value: string) => void
	placeholder?: string
	size?: 'md' | 'sm' | 'xl'
	value?: null | string
}

/* * */

export function SearchInput({ onChange, placeholder = 'placeholder', size = 'md', value }: SearchInputProps) {
	//

	//
	// A. Setup variables

	const [isInUse, setIsInUse] = useState(false);
	const { t } = useTranslation('global', { keyPrefix: 'components.search_input' });

	//
	// B. Handle actions

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!onChange) return;
		onChange(event.target.value);
	};

	const handleClear = () => {
		if (!onChange) return;
		onChange('');
		setIsInUse(false);
	};

	const handleFocus = () => {
		setIsInUse(true);
	};

	const handleBlur = () => {
		if (value?.length) return;
		setIsInUse(false);
	};

	//
	// C. Render components

	return (
		<MantineTextInput
			leftSection={<IconSearch size={size === 'xl' ? 28 : 20} />}
			onBlur={handleBlur}
			onChange={handleChange}
			onFocus={handleFocus}
			placeholder={placeholder === 'placeholder' ? t('placeholder') : placeholder}
			size={size}
			styles={{ root: { width: isInUse || size === 'xl' ? '100%' : 200 } }}
			value={value ?? ''}
			rightSection={
				(typeof value === 'string' && value.length > 0) && (
					<MantineActionIcon color="var(--color-system-text-300)" onClick={handleClear} variant="transparent">
						<IconX size={20} />
					</MantineActionIcon>
				)
			}
		/>
	);

	//
}
