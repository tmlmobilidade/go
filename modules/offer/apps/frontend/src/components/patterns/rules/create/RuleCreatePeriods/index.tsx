'use client';

/* * */

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
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

export function RuleCreatePeriods() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();
	const { data: periodsData } = usePeriodsContext();

	const PERIOD_OPTIONS = periodsData.raw.map(period => ({
		label: period.name,
		value: period._id,
	}));

	const allPeriodIds = PERIOD_OPTIONS.map(p => p.value);

	//
	// B. Handle actions

	const currentPeriodIds = createRuleContext.data.form.values.year_period_ids || [];
	const selectedPresetKey = getSelectedPresetKey(currentPeriodIds, allPeriodIds);

	const applyPreset = (key: null | PeriodPresetKey) => {
		if (!key) {
			// same convention as weekdays: empty => undefined
			createRuleContext.data.form.setFieldValue('year_period_ids', undefined);
			return;
		}

		// select all
		createRuleContext.data.form.setFieldValue('year_period_ids', [...allPeriodIds]);
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
					createRuleContext.data.form.setFieldValue('year_period_ids', selectedPeriods.length > 0 ? selectedPeriods : undefined);
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
