'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { Section, SegmentedMultiSelect, SelectChipGroup, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { RuleAsteriskField } from '../../shared/RuleAsteriskField';

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

	const { t } = useTranslation();
	const createRuleContext = useRuleCreateContext();
	const { data: periodsData } = usePeriodsContext();

	const PERIOD_OPTIONS = periodsData.raw.map(period => ({
		label: period.name,
		value: period._id,
	}));

	const allPeriodIds = PERIOD_OPTIONS.map(p => p.value);

	//
	// B. Handle actions

	const currentPeriodIds = createRuleContext.data.values.year_period_ids || [];
	const selectedPresetKey = getSelectedPresetKey(currentPeriodIds, allPeriodIds);

	const applyPreset = (key: null | PeriodPresetKey) => {
		if (!key) {
			createRuleContext.form.setValue('year_period_ids', [], { shouldDirty: true, shouldValidate: true });
			return;
		}

		// select all
		createRuleContext.form.setValue('year_period_ids', [...allPeriodIds], { shouldDirty: true, shouldValidate: true });
	};

	//
	// C. Render components

	return (
		<Section gap="md">
			<Section gap="xs" padding="none">
				<RuleAsteriskField withAsterisk={!createRuleContext.flags.isEventExceptionEnabled}>
					{t('default:scheduling.copy.periods')}
				</RuleAsteriskField>
				<Text c="dimmed" size="sm">
					{t(createRuleContext.flags.isEventExceptionEnabled ? 'default:patterns.create.RuleCreatePeriods.optional_hint' : 'default:patterns.create.RuleCreatePeriods.required_hint')}
				</Text>
			</Section>

			{/* Quick Select Tags */}
			<SelectChipGroup<PeriodPresetKey>
				onChange={applyPreset}
				value={selectedPresetKey}
				options={[
					{ label: t('default:scheduling.copy.all'), value: 'all' },
				]}
			/>

			<SegmentedMultiSelect
				value={currentPeriodIds}
				onChange={(selectedPeriods) => {
					createRuleContext.form.setValue('year_period_ids', selectedPeriods, { shouldDirty: true, shouldValidate: true });
				}}
				options={PERIOD_OPTIONS.map(o => ({
					ariaLabel: o.label,
					label: o.label,
					value: o.value,
				}))}
			/>
			{createRuleContext.form.formState.errors.year_period_ids?.message && (
				<Text c="var(--color-status-danger-primary)">
					{t('default:scheduling.copy.selectPeriod')}
				</Text>
			)}

		</Section>
	);
}
