'use client';

import { useCalendarDayCounterContext } from '@/components/calendar/day-counter/CalendarDayCounter.context';
import { Section, SegmentedMultiSelect, SelectChipGroup, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

type PeriodPresetKey = 'all';

/* * */

export function CalendarDayCounterPeriods() {
	//

	//
	// A. Setup variables

	const dayCounterContext = useCalendarDayCounterContext();
	const { t } = useTranslation();
	const periodOptions = dayCounterContext.data.periods.map(period => ({
		label: period.name,
		value: period._id,
	}));
	const allPeriodIds = periodOptions.map(option => option.value);
	const hasEveryPeriodSelected = allPeriodIds.every(periodId => dayCounterContext.filters.periodIds.includes(periodId));
	const isAllSelected = allPeriodIds.length > 0 && allPeriodIds.length === dayCounterContext.filters.periodIds.length && hasEveryPeriodSelected;

	//
	// B. Handle actions

	const handlePresetChange = (value: null | PeriodPresetKey) => {
		dayCounterContext.actions.setPeriodIds(value === 'all' ? allPeriodIds : []);
	};

	//
	// C. Render components

	return (
		<Section gap="md" padding="none">
			<Section gap="xs" padding="none">
				<Text>{t('shared:components.calendar.types.period')}</Text>
			</Section>

			{dayCounterContext.filters.agencyId && periodOptions.length > 0 ? (
				<>
					<SelectChipGroup<PeriodPresetKey>
						onChange={handlePresetChange}
						options={[{ label: t('default:calendar.dayCounter.all'), value: 'all' }]}
						value={isAllSelected ? 'all' : null}
					/>

					<SegmentedMultiSelect
						onChange={dayCounterContext.actions.setPeriodIds}
						options={periodOptions}
						size="sm"
						value={dayCounterContext.filters.periodIds}
						wrap
					/>
				</>
			) : (
				<Text c="dimmed" size="sm">
					{t(dayCounterContext.filters.agencyId ? 'default:calendar.dayCounter.noPeriods' : 'default:calendar.dayCounter.selectAgencyFirst')}
				</Text>
			)}
		</Section>
	);

	//
}
