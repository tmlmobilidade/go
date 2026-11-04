'use client';

import { useRuleCreateContext } from '@/components/events/rules/RuleCreate.context';
import { usePeriodsData } from '@/components/year-periods/shared/use-periods-data';
import { Section, SegmentedMultiSelect, SelectChipGroup, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

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

	const { t } = useTranslation();

	const createRuleContext = useRuleCreateContext();
	const { data: periodsData } = usePeriodsData();

	// Filter periods by event's agency_ids
	const eventAgencyIds = new Set(createRuleContext.eventData.agency_ids);
	const filteredPeriods = periodsData.filter(period =>
		period.agency_ids?.some(agencyId => eventAgencyIds.has(agencyId)),
	);

	const PERIOD_OPTIONS = filteredPeriods.map(period => ({
		label: period.name,
		value: period._id,
	}));

	const allPeriodIds = PERIOD_OPTIONS.map(p => p.value);

	//
	// B. Handle actions

	const currentPeriodIds = createRuleContext.values.kind === 'event_replacement'
		? createRuleContext.values.year_period_ids || []
		: [];
	const selectedPresetKey = getSelectedPresetKey(currentPeriodIds, allPeriodIds);

	const applyPreset = (key: null | PeriodPresetKey) => {
		if (createRuleContext.values.kind !== 'event_replacement') return;

		if (!key) {
			// Keep the array contract when clearing the selection.
			createRuleContext.form.setValue('year_period_ids', []);
			return;
		}

		// select all
		createRuleContext.form.setValue('year_period_ids', [...allPeriodIds]);
	};

	//
	// C. Render components

	return (
		<Section gap="md">
			<Section gap="xs" padding="none">
				<Text>{t('default:events.ruleEditor.periods')}</Text>
			</Section>

			{/* Quick Select Tags */}
			<SelectChipGroup<PeriodPresetKey>
				onChange={applyPreset}
				value={selectedPresetKey}
				options={[
					{ label: t('default:events.ruleEditor.all'), value: 'all' },
				]}
			/>

			<SegmentedMultiSelect
				value={currentPeriodIds}
				onChange={(selectedPeriods) => {
					if (createRuleContext.values.kind !== 'event_replacement') return;
					createRuleContext.form.setValue('year_period_ids', selectedPeriods);
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
