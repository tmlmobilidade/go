'use client';

import { Label, Section } from '../../../components';
import { FilterWrapper } from '../../shared/FilterWrapper';
import { SearchField } from '../SearchField';

/* * */

interface TextFilterProps {
	active?: boolean
	description?: string
	disabled?: boolean
	label: string
	onChange?: (value: string) => void
	placeholder?: string
	value?: null | string
}

/* * */

export function TextFilter({ active, description, disabled, label, onChange, placeholder, value }: TextFilterProps) {
	return (
		<FilterWrapper active={active} disabled={disabled} label={label}>
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
