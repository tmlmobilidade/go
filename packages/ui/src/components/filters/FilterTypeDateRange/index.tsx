/* * */

import { type UnixTimestamp } from '@tmlmobilidade/types';

import { DateTimeInput } from '../../dates/DateTimeInput';
import { Label } from '../../display/Label';
import { Section } from '../../layout/Section';
import { Spacer } from '../../layout/Spacer';
import { FilterWrapper } from '../FilterWrapper';

/* * */

interface FilterTypeDateRangeProps {
	active?: boolean
	clearable?: boolean
	disabled?: boolean
	endDate?: null | UnixTimestamp
	label: string
	onEndDateChange?: (values: null | UnixTimestamp) => void
	onStartDateChange?: (values: null | UnixTimestamp) => void
	startDate?: null | UnixTimestamp
}

/* * */

export function FilterTypeDateRange({ active, clearable = false, disabled, endDate, label, onEndDateChange, onStartDateChange, startDate }: FilterTypeDateRangeProps) {
	return (
		<FilterWrapper
			active={active}
			disabled={disabled}
			label={label}
		>
			<Section gap="sm" height="auto" padding="md" width="auto">
				<Label size="md">Data de Início</Label>
				<DateTimeInput
					onChange={onStartDateChange}
					value={startDate}
				/>
				<Spacer />
				<Label size="md">Data de Fim</Label>
				<DateTimeInput
					onChange={onEndDateChange}
					value={endDate}
				/>
			</Section>
		</FilterWrapper>
	);
}
