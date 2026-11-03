'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { DayPeriod } from '@tmlmobilidade/go-types-offer';
import { getDayPeriodLabels } from '@tmlmobilidade/go-utils-offer';
import { Section, SegmentedMultiSelect, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ParameterCreateDayPeriod() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const createParameterContext = useParameterCreateContext();

	//
	// B. Handle actions

	const currentPeriods = createParameterContext.data.values.kind === 'override' ? createParameterContext.data.values.day_periods || [] : [];

	//
	// C. Render components

	return (
		<Section gap="md">

			<Section gap="xs" padding="none">
				<Text>{t('default:scheduling.dayPeriodsTitle')}</Text>
			</Section>

			<SegmentedMultiSelect
				value={currentPeriods}
				onChange={(selectedPeriods) => {
					createParameterContext.form.setValue(
						'day_periods',
						selectedPeriods.length > 0
							? (selectedPeriods as DayPeriod[])
							: undefined,
						{ shouldDirty: true, shouldValidate: true },
					);
				}}
				options={Object.entries(getDayPeriodLabels(t)).map(([key, label]) => ({
					label: label.short_with_time ?? label.short,
					value: key as DayPeriod,
				}))}
			/>

		</Section>
	);
}
