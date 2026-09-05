'use client';

import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { TimetableDisplay } from '@/components/lines/detail/TimetableDisplay';
import { useOperationalDate } from '@/hooks/transit/useOperationalDate';
import { createTimetable } from '@/utils/transit/create-timetable';
import { type Timetable } from '@tmlmobilidade/go-types-hub';
import { type OperationalDateInt, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function PathWaypointTimetable() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const linesDetailContext = useLinesDetailContext();
	const operationalDate = useOperationalDate();

	const showVariantsOnTimetable = true;

	//
	// B. Transform data

	const timetableData = useMemo<null | OperationalDateInt | Timetable>(() => {
		// Setup variables
		const activePatternGroup = linesDetailContext.data.active_pattern;
		const secondaryPatternGroups = linesDetailContext.data.valid_patterns?.filter(patternGroup => patternGroup.version_id !== activePatternGroup?.version_id) || [];
		const mentionedRoutes = linesDetailContext.data.routes;
		const selectedStopId = linesDetailContext.data.active_waypoint?.stop_id;
		const selectedStopSequence = linesDetailContext.data.active_waypoint?.stop_sequence;
		const selectedOperationalDateRaw = operationalDate.selectedOperationalDate;
		// Check if all these variables are defined
		if (!activePatternGroup || !mentionedRoutes || !selectedStopId || selectedStopSequence === undefined || !selectedOperationalDateRaw) {
			return null;
		}
		const selectedOperationalDate = OperationalDateIntSchema.parse(selectedOperationalDateRaw);

		// Check if there are schedules for the selected operational day
		if (!activePatternGroup.valid_on.includes(selectedOperationalDate)) {
			// Find the closest valid date
			return activePatternGroup.valid_on.reduce<null | OperationalDateInt>((closestDate, currentDate) => {
				if (selectedOperationalDate <= currentDate && (closestDate === null || currentDate < closestDate)) return currentDate;
				return closestDate;
			}, null);
		}

		// Check if the user has enabled complex schedules
		if (showVariantsOnTimetable) {
			return createTimetable(activePatternGroup, secondaryPatternGroups, mentionedRoutes, selectedStopId, selectedStopSequence, selectedOperationalDate);
		} else {
			return createTimetable(activePatternGroup, [], [], selectedStopId, selectedStopSequence, selectedOperationalDate);
		}
	}, [linesDetailContext.data.active_pattern, linesDetailContext.data.valid_patterns, linesDetailContext.data.routes, linesDetailContext.data.active_waypoint?.stop_id, linesDetailContext.data.active_waypoint?.stop_sequence, operationalDate.selectedOperationalDate, showVariantsOnTimetable]);

	//
	// C. Handle actions

	function handleNextDateClick(date: Date) {
		operationalDate.setOperationalDateFromJsDate(date);
	}

	//
	// D. Render components

	if (!timetableData) {
		return (
			<div className={styles.container}>
				<p className={styles.noData}>{t('default:lines.PathWaypointTimetable.no_data')}</p>
			</div>
		);
	}

	if (typeof timetableData === 'number') {
		const nextDate = Dates.fromOperationalDateInt(timetableData, 'Europe/Lisbon').js_date;
		return (
			<div className={styles.container}>
				<p className={styles.noData}>{t('default:lines.PathWaypointTimetable.no_data')}</p>
				{nextDate && <p className={styles.nextDate} onClick={() => handleNextDateClick(nextDate)}>{t('lines.PathWaypointTimetable.next_date', '', { value: nextDate })}</p>}
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<p className={styles.title}>{t('default:lines.PathWaypointTimetable.title')}</p>
			<TimetableDisplay timetableData={timetableData} />
		</div>
	);

	//
}
