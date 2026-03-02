'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/stops/parameters/create/ParameterCreate.context';
import { DAY_PERIOD_LABELS, DayPeriod } from '@tmlmobilidade/types';
import { Section, SegmentedMultiSelect, Text } from '@tmlmobilidade/ui';

/* * */

export function ParameterCreateDayPeriod() {
	//

	//
	// A. Setup variables

	const createParameterContext = useParameterCreateContext();

	//
	// B. Handle actions

	const currentPeriods = createParameterContext.data.form.values.kind === 'override' ? createParameterContext.data.form.values.day_periods || [] : [];

	//
	// C. Render components

	return (
		<Section gap="md">

			<Section gap="xs" padding="none">
				<Text>Períodos do Dia</Text>
			</Section>

			<SegmentedMultiSelect
				value={currentPeriods}
				onChange={(selectedPeriods) => {
					createParameterContext.data.form.setFieldValue(
						'day_periods',
						selectedPeriods.length > 0
							? (selectedPeriods as DayPeriod[])
							: undefined,
					);
				}}
				options={Object.entries(DAY_PERIOD_LABELS).map(([key, label]) => ({
					label: label.short_with_time ?? label.short,
					value: key as DayPeriod,
				}))}
			/>

		</Section>
	);
}
