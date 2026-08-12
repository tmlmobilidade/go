'use client';

import { useRef } from 'react';

import { Label, Section } from '../../../components';
import { FilterWrapper, type FilterWrapperRef } from '../../shared/FilterWrapper';
import { SearchField } from '../SearchField';

/* * */

interface TextFilterProps {
	active?: boolean
	description?: string
	disabled?: boolean
	label: string
	onChange?: (value: string) => void
	onClose?: () => void
	placeholder?: string
	value?: null | string
}

/* * */

export function TextFilter({ active, description, disabled, label, onChange, onClose, placeholder, value }: TextFilterProps) {
	//

	//
	// A. Setup variables

	const filterWrapperRef = useRef<FilterWrapperRef>(null);

	//
	// B. Render components

	return (
		<FilterWrapper ref={filterWrapperRef} active={active} disabled={disabled} label={label} onClose={onClose}>
			<Section gap="sm" height="auto" padding="md" width="auto">
				<SearchField
					onChange={onChange}
					placeholder={placeholder}
					value={value}
				/>
				{description && <Label size="sm" variant="muted">{description}</Label>}
			</Section>
		</FilterWrapper>
	);
}
