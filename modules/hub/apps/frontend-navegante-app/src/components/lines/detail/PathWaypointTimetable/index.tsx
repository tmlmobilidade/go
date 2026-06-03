'use client';

import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { TimetableDisplay } from '@/components/lines/detail/TimetableDisplay';
import { useOperationalDateContext } from '@/contexts/OperationalDate.context';
import { type Timetable } from  '@tmlmobilidade/types';
import { createTimetable } from '@/utils/create-timetable';
import { Dates } from '@tmlmobilidade/dates';
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
	const operationalDateContext = useOperationalDateContext();

	const showVariantsOnTimetable = true;

	//
	// B. Transform data

	const timetableData = useMemo<null | string | Timetable>(() => {
		// Setup variables
		const activePatternGroup = linesDetailContext.data.active_pattern;
		const secondaryPatternGroups = linesDetailContext.data.valid_patterns?.filter(patternGroup => patternGroup.version_id !== activePatternGroup?.version_id) || [];
		const mentionedRoutes = linesDetailContext.data.routes;
		const selectedStopId = linesDetailContext.data.active_waypoint?.stop_id;
		const selectedStopSequence = linesDetailContext.data.active_waypoint?.stop_sequence;
		const selectedOperationalDate = operationalDateContext.data.selected_date?.operational_date;
		// Check if all these variables are defined
		if (!activePatternGroup || !mentionedRoutes || !selectedStopId || selectedStopSequence === undefined || !selectedOperationalDate) {
			return null;
		}

		// Check if there are schedules for the selected operational day
		if (!activePatternGroup.valid_on.includes(selectedOperationalDate)) {
			// Find the closest valid date
			return activePatternGroup.valid_on.reduce((acc, curr) => {
				if (selectedOperationalDate <= curr && (acc === '' || curr < acc)) return curr;
				return acc;
			}, '');
		}

		// Check if the user has enabled complex schedules
		if (showVariantsOnTimetable) {
			return createTimetable(activePatternGroup, secondaryPatternGroups, mentionedRoutes, selectedStopId, selectedStopSequence, selectedOperationalDate);
		} else {
			return createTimetable(activePatternGroup, [], [], selectedStopId, selectedStopSequence, selectedOperationalDate);
		}
	}, [linesDetailContext.data.active_pattern, linesDetailContext.data.valid_patterns, linesDetailContext.data.routes, linesDetailContext.data.active_waypoint?.stop_id, linesDetailContext.data.active_waypoint?.stop_sequence, operationalDateContext.data.selected_date?.operational_date, showVariantsOnTimetable]);

	//
	// C. Handle actions

	function handleNextDateClick(date: Date) {
		operationalDateContext.actions.updateSelectedDateFromJsDate(date);
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

	if (typeof timetableData === 'string') {
		const nextDate = timetableData && Dates.fromOperationalDate(timetableData, 'Europe/Lisbon').js_date;
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
