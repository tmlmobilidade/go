'use client';

import { toCalendarDate } from '@tmlmobilidade/go-types-shared';
import { DateInput, FilterWrapper, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAnnotationsListFilterDates } from './use-annotations-list-filter-dates';

/* * */

export function AnnotationsListFilterDates() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const dates = useAnnotationsListFilterDates();

	//
	// B. Render components

	return (
		<FilterWrapper active={dates.isActive} label={t('annotations:list.AnnotationsListFilterDates.label')}>
			<Section gap="sm" padding="md" width={280}>
				<DateInput
					label={t('annotations:list.AnnotationsListFilterDates.start')}
					maxDate={dates.endDate ? toCalendarDate(dates.endDate) : undefined}
					onChange={dates.setStart}
					placeholder={t('annotations:list.AnnotationsListFilterDates.placeholder')}
					popoverProps={{ withinPortal: false }}
					value={dates.startDate}
					clearable
				/>
				<DateInput
					label={t('annotations:list.AnnotationsListFilterDates.end')}
					minDate={dates.startDate ? toCalendarDate(dates.startDate) : undefined}
					onChange={dates.setEnd}
					placeholder={t('annotations:list.AnnotationsListFilterDates.placeholder')}
					popoverProps={{ withinPortal: false }}
					value={dates.endDate}
					clearable
				/>
			</Section>
		</FilterWrapper>
	);
}
