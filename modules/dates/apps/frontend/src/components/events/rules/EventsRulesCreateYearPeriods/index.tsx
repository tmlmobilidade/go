'use client';

import { useYearPeriodsRawData } from '@/components/year-periods/shared/use-year-periods-raw-data';
import { type EventReplacementRule } from '@tmlmobilidade/go-types-offer';
import { Section, SegmentedMultiSelect, SelectChipGroup, Text } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useEventsRulesCreateFormContext } from '../EventsRulesCreateForm.context';

/* * */

type YearPeriodPresetKey = 'all';

/* * */

function getSelectedPresetKey(currentYearPeriodIds: string[], allYearPeriodIds: string[]): null | YearPeriodPresetKey {
	if (!currentYearPeriodIds.length) return null;
	const isAllSelected = allYearPeriodIds.length > 0 && allYearPeriodIds.every(id => currentYearPeriodIds.includes(id)) && currentYearPeriodIds.length === allYearPeriodIds.length;
	return isAllSelected ? 'all' : null;
}

/* * */

export function EventsRulesCreateYearPeriods() {
	//

	//
	// A. Setup variables

	const { eventData, form, values } = useEventsRulesCreateFormContext();

	const { data: yearPeriodsData } = useYearPeriodsRawData();

	const currentYearPeriodIds = values.kind === 'event_replacement' ? values.year_period_ids || [] : [];

	//
	// B. Transform data

	const yearPeriodOptions = useMemo(() => {
		// Keep only the year periods of the event agencies
		const eventAgencyIds = new Set(eventData.agency_ids);
		return yearPeriodsData
			.filter(yearPeriod => yearPeriod.agency_ids?.some(agencyId => eventAgencyIds.has(agencyId)))
			.map(yearPeriod => ({
				ariaLabel: yearPeriod.name,
				label: yearPeriod.name,
				value: yearPeriod._id,
			}));
	}, [eventData.agency_ids, yearPeriodsData]);

	const allYearPeriodIds = useMemo(() => yearPeriodOptions.map(option => option.value), [yearPeriodOptions]);

	const selectedPresetKey = getSelectedPresetKey(currentYearPeriodIds, allYearPeriodIds);

	//
	// C. Handle actions

	const setYearPeriodIds = (yearPeriodIds: EventReplacementRule['year_period_ids'] | undefined) => {
		if (values.kind !== 'event_replacement') return;
		// An empty selection is stored as undefined so the schema flags it as missing
		form.setValue('year_period_ids', yearPeriodIds as EventReplacementRule['year_period_ids'], { shouldDirty: true, shouldValidate: true });
	};

	const handleApplyPreset = (key: null | YearPeriodPresetKey) => {
		setYearPeriodIds(key ? [...allYearPeriodIds] : undefined);
	};

	const handleChangeYearPeriods = (selectedYearPeriodIds: string[]) => {
		setYearPeriodIds(selectedYearPeriodIds.length > 0 ? selectedYearPeriodIds : undefined);
	};

	//
	// D. Render components

	return (
		<Section gap="md">
			<Section gap="xs" padding="none">
				<Text>Períodos</Text>
			</Section>
			<SelectChipGroup<YearPeriodPresetKey>
				onChange={handleApplyPreset}
				value={selectedPresetKey}
				options={[
					{ label: 'Todos', value: 'all' },
				]}
			/>
			<SegmentedMultiSelect
				onChange={handleChangeYearPeriods}
				options={yearPeriodOptions}
				value={currentYearPeriodIds}
			/>
		</Section>
	);
}
