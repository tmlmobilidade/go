/* * */

import { type UnixTimestamp } from '@tmlmobilidade/types';

import { DateTimeInput } from '../../dates/DateTimeInput';
import { Label } from '../../display/Label';
import { Section } from '../../layout/Section';
import { FilterWrapper } from '../FilterWrapper';

/* * */

interface FilterTypeCreationDateProps {
	active?: boolean
	clearable?: boolean
	creationDateEnd?: null | UnixTimestamp
	creationDateStart?: null | UnixTimestamp
	disabled?: boolean
	label: string
	onCreationDateChange?: (values: null | UnixTimestamp) => void
	onCreationDateLimitChange?: (values: null | UnixTimestamp) => void

}

/* * */

export function FilterTypeCreationDate({ active, clearable = false, creationDateEnd, creationDateStart, disabled, label, onCreationDateChange, onCreationDateLimitChange }: FilterTypeCreationDateProps) {
	return (
		<FilterWrapper
			active={active}
			disabled={disabled}
			label={label}
		>
			<Section gap="sm" height="auto" padding="md" width="auto">
				<Label size="md">Criado entre</Label>
				<DateTimeInput
					clearable={clearable}
					onChange={onCreationDateChange}
					value={creationDateStart}
				/>
				<DateTimeInput
					clearable={clearable}
					onChange={onCreationDateLimitChange}
					value={creationDateEnd}
				/>

			</Section>
		</FilterWrapper>
	);
}
