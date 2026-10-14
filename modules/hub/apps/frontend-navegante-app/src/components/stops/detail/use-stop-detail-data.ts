'use client';

import { useAlertsData } from '@/components/alerts/use-alerts-data';
import { useLinesData } from '@/components/lines/use-lines-data';
import { useStopsData } from '@/components/stops/use-stops-data';
import { useStopEtaData } from '@/hooks/transit/use-stop-eta-data';
import { useOperationalDate } from '@/hooks/transit/useOperationalDate';
import { fetchPatterns } from '@/utils/transit/fetch-patterns';
import { buildStopTimetable, type StopsDetailViewTimetableData } from '@/utils/transit/stop-timetable';
import { HubV1ApiAlert, HubV1ApiLine, HubV1ApiPattern, HubV1ApiStop } from '@tmlmobilidade/go-types-hub';
import { useMemo } from 'react';
import useSWR from 'swr';

export type { StopsDetailViewTimetableData } from '@/utils/transit/stop-timetable';

/* * */

interface UseStopDetailDataReturnType {
	activeAlerts: HubV1ApiAlert[]
	associatedLines: HubV1ApiLine[]
	hasError: boolean
	isLoading: boolean
	isNotFound: boolean
	stop: HubV1ApiStop | undefined
	timetable: StopsDetailViewTimetableData[]
}

/* * */

export function useStopDetailData(stopId: string): UseStopDetailDataReturnType {
	//

	// A. Fetch data

	const { data: alerts } = useAlertsData();
	const { data: lines, error: linesError, isLoading: isLinesLoading } = useLinesData();
	const { data: stops, error: stopsError, isLoading: isStopsLoading } = useStopsData();
	const { data: stopEtas } = useStopEtaData(stopId);
	const { isTodaySelected, selectedOperationalDate } = useOperationalDate();

	const stop = useMemo(() => stops.find(candidate => String(candidate._id) === String(stopId)), [stopId, stops]);
	const patternIds = stop?.pattern_ids ?? [];
	const { data: associatedPatterns, error: patternsError, isLoading: isPatternsLoading } = useSWR<HubV1ApiPattern[][]>(stop ? ['stop-patterns', ...patternIds] : null, async () => await fetchPatterns(patternIds));

	//
	// B. Transform data

	const associatedLines = useMemo(() => lines.filter(line => stop?.line_ids.includes(line._id)), [lines, stop?.line_ids]);
	const activeAlerts = useMemo(() => getStopAlerts(alerts, stop), [alerts, stop]);
	const validPatterns = useMemo(() => associatedPatterns?.flat().filter(pattern => selectedOperationalDate ? pattern?.valid_on?.includes(selectedOperationalDate) : false), [associatedPatterns, selectedOperationalDate]);
	const timetable = useMemo(() => buildStopTimetable({ isTodaySelected, selectedOperationalDate, stopEtas, stopId, validPatterns }), [isTodaySelected, selectedOperationalDate, stopEtas, stopId, validPatterns]);

	//
	// C. Return data

	return useMemo(() => ({
		activeAlerts,
		associatedLines,
		hasError: Boolean(linesError || patternsError || stopsError),
		isLoading: isLinesLoading || isPatternsLoading || isStopsLoading,
		isNotFound: !isStopsLoading && !stopsError && !stop,
		stop,
		timetable,
	}), [activeAlerts, associatedLines, isLinesLoading, isPatternsLoading, isStopsLoading, linesError, patternsError, stop, stopsError, timetable]);

	//
}

/* * */

function getStopAlerts(alerts: HubV1ApiAlert[], stop: HubV1ApiStop | undefined): HubV1ApiAlert[] {
	if (!stop) return [];

	return alerts.filter((alert) => {
		if (alert.reference_type === 'agency') return stop.agency_ids.includes(alert.agency_id);
		if (alert.reference_type === 'stops') return alert.references.some(reference => reference.parent_id === String(stop._id));
		if (alert.reference_type === 'lines') return alert.references.some(reference => reference.child_ids.includes(String(stop._id)));
		return false;
	});
}
