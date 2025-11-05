/* * */

import { DateTimePicker } from '@/components/dates/DateTimePicker';
import { FilterWrapper } from '@/components/filters/FilterWrapper';
import { Section } from '@/components/layout/Section';
import { type UnixTimestamp } from '@tmlmobilidade/types';

/* * */

interface FilterTypeDateRangeProps {
	active?: boolean
	disabled?: boolean
	endDate?: null | UnixTimestamp
	label: string
	onEndDateChange?: (values: null | UnixTimestamp) => void
	onStartDateChange?: (values: null | UnixTimestamp) => void
	startDate?: null | UnixTimestamp
}

/* * */

export function FilterTypeDateRange({ active, disabled, endDate, label, onEndDateChange, onStartDateChange, startDate }: FilterTypeDateRangeProps) {
	return (
		<FilterWrapper
			active={active}
			disabled={disabled}
			label={label}
		>
			<Section gap="md" padding="sm">
				<DateTimePicker
					onChange={onStartDateChange}
					placeholder="Data de Início"
					value={startDate}
					fullWidth
				/>
				<DateTimePicker
					onChange={onEndDateChange}
					placeholder="Data de Fim"
					value={endDate}
					fullWidth
				/>
			</Section>
		</FilterWrapper>
	);
};
