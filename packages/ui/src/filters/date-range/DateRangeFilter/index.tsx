/* * */

import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';

import { DateTimeInput, Label, Section, Spacer } from '../../../components';
import { FilterWrapper } from '../../shared';

/* * */

interface DateRangeFilterProps {
	active?: boolean
	clearable?: boolean
	disabled?: boolean
	endDate?: null | UnixMilliseconds
	label: string
	onEndDateChange?: (values: null | UnixMilliseconds) => void
	onStartDateChange?: (values: null | UnixMilliseconds) => void
	startDate?: null | UnixMilliseconds
}

/* * */

export function DateRangeFilter({ active, clearable = false, disabled, endDate, label, onEndDateChange, onStartDateChange, startDate }: DateRangeFilterProps) {
	return (
		<FilterWrapper
			active={active}
			disabled={disabled}
			label={label}
		>
			<Section gap="sm" height="auto" padding="md" width="auto">
				<Label size="md">Data de Início</Label>
				<DateTimeInput
					clearable={clearable}
					onChange={onStartDateChange}
					value={startDate}
				/>
				<Spacer />
				<Label size="md">Data de Fim</Label>
				<DateTimeInput
					clearable={clearable}
					onChange={onEndDateChange}
					value={endDate}
				/>
			</Section>
		</FilterWrapper>
	);
}
