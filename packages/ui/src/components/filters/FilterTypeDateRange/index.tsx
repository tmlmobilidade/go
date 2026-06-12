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
	creationDate?: null | UnixTimestamp
	disabled?: boolean
	endDate?: null | UnixTimestamp
	label: string
	onCreationDateChange?: (values: null | UnixTimestamp) => void
	onEndDateChange?: (values: null | UnixTimestamp) => void
	onStartDateChange?: (values: null | UnixTimestamp) => void
	startDate?: null | UnixTimestamp
	thirdOption?: boolean
}

/* * */

export function FilterTypeDateRange({ active, clearable = false, creationDate, disabled, endDate, label, onCreationDateChange, onEndDateChange, onStartDateChange, startDate, thirdOption }: FilterTypeDateRangeProps) {
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
				{thirdOption && (
					<>
						<Spacer />
						<Label size="md">Criação do Alerta</Label>
						<DateTimeInput
							clearable={clearable}
							onChange={onCreationDateChange}
							value={creationDate}
						/>
					</>
				)}
			</Section>
		</FilterWrapper>
	);
}
