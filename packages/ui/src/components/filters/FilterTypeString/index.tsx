'use client';

import { useRef } from 'react';

import { Label } from '../../display/Label';
import { SearchInput } from '../../inputs/SearchInput';
import { Section } from '../../layout/Section';
import { FilterWrapper, type FilterWrapperRef } from '../FilterWrapper';

/* * */

interface FilterTypeStringProps {
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

export function FilterTypeString({ active, description, disabled, label, onChange, onClose, placeholder, value }: FilterTypeStringProps) {
	//

	//
	// A. Setup variables

	const filterWrapperRef = useRef<FilterWrapperRef>(null);

	//
	// B. Render components

	return (
		<FilterWrapper ref={filterWrapperRef} active={active} disabled={disabled} label={label} onClose={onClose}>
			<Section gap="sm" height="auto" padding="md" width="auto">
				<SearchInput
					onChange={onChange}
					placeholder={placeholder}
					value={value}
				/>
				{description && <Label size="sm" variant="muted">{description}</Label>}
			</Section>
		</FilterWrapper>
	);
}
