'use client';

/* * */

import { useParameterCreateContext } from '@/components/patterns/shape/parameters/create/ParameterCreate.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { Section, SegmentedMultiSelect, SelectChipGroup, Text } from '@tmlmobilidade/ui';

/* * */

type PeriodPresetKey = 'all';

function getSelectedPresetKey(
	currentPeriodIds: string[] | undefined,
	allPeriodIds: string[],
): null | PeriodPresetKey {
	if (!currentPeriodIds?.length) return null;

	const isAllSelected = allPeriodIds.length > 0 && allPeriodIds.every(id => currentPeriodIds.includes(id)) && currentPeriodIds.length === allPeriodIds.length;

	return isAllSelected ? 'all' : null;
}

/* * */

export function ParameterCreateYearPeriods() {
	//

	//
	// A. Setup variables

	const createParameterContext = useParameterCreateContext();
	const { data: yearPeriodsData } = usePeriodsContext();

	const PERIOD_OPTIONS = yearPeriodsData.raw.map(period => ({
		label: period.name,
		value: period._id,
	}));

	const allPeriodIds = PERIOD_OPTIONS.map(p => p.value);

	//
	// B. Handle actions

	if (createParameterContext.data.form.values.kind === 'default') return null;

	const currentPeriodIds = createParameterContext.data.form.values.year_period_ids || [];
	const selectedPresetKey = getSelectedPresetKey(currentPeriodIds, allPeriodIds);

	const applyPreset = (key: null | PeriodPresetKey) => {
		if (!key) {
			// same convention as weekdays: empty => undefined
			createParameterContext.data.form.setFieldValue('year_period_ids', undefined);
			return;
		}

		// select all
		createParameterContext.data.form.setFieldValue('year_period_ids', [...allPeriodIds]);
	};

	//
	// C. Render components

	return (
		<Section gap="md">
			<Section gap="xs" padding="none">
				<Text>Períodos</Text>
			</Section>

			{/* Quick Select Tags */}
			<SelectChipGroup<PeriodPresetKey>
				onChange={applyPreset}
				value={selectedPresetKey}
				options={[
					{ label: 'Todos', value: 'all' },
				]}
			/>

			<SegmentedMultiSelect
				value={currentPeriodIds}
				onChange={(selectedPeriods) => {
					createParameterContext.data.form.setFieldValue('year_period_ids', selectedPeriods.length > 0 ? selectedPeriods : undefined);
				}}
				options={PERIOD_OPTIONS.map(o => ({
					ariaLabel: o.label,
					label: o.label,
					value: o.value,
				}))}
			/>
		</Section>
	);
}
