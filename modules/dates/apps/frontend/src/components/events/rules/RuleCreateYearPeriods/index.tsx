'use client';

/* * */

import { useRuleCreateContext } from '@/components/events/rules/RuleCreate.context';
import { usePeriodsListContext } from '@/components/year-periods/list/PeriodsList.context';
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

export function RuleCreateYearPeriods() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();
	const { data: periodsData } = usePeriodsListContext();

	// Filter periods by event's agency_ids
	const eventAgencyIds = new Set(createRuleContext.data.eventData.agency_ids);
	const filteredPeriods = periodsData.raw.filter(period =>
		period.agency_ids?.some(agencyId => eventAgencyIds.has(agencyId)),
	);

	const PERIOD_OPTIONS = filteredPeriods.map(period => ({
		label: period.name,
		value: period._id,
	}));

	const allPeriodIds = PERIOD_OPTIONS.map(p => p.value);

	//
	// B. Handle actions

	const currentPeriodIds = createRuleContext.data.form.values.kind === 'event_replacement'
		? createRuleContext.data.form.values.year_period_ids || []
		: [];
	const selectedPresetKey = getSelectedPresetKey(currentPeriodIds, allPeriodIds);

	const applyPreset = (key: null | PeriodPresetKey) => {
		if (createRuleContext.data.form.values.kind !== 'event_replacement') return;

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
					if (createRuleContext.data.form.values.kind !== 'event_replacement') return;
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
