import { getItineraryWalkMinutes } from '@/utils/route-planner/planning/results';
import { formatMotisPlanDuration, formatMotisPlanTime } from '@/utils/route-planner/presentation/format';
import { getRoutePlannerTransitLegLabel, isMotisWalkingLeg } from '@/utils/route-planner/presentation/modes';
import { type MotisItinerary } from '@tmlmobilidade/go-types-motis';

/* * */

type RoutePlannerStatusTranslate = (key: string, defaultValue: string, options?: Record<string, unknown>) => string;

/* * */

export function getRoutePlannerItineraryStatusSummary(itinerary: MotisItinerary, translate: RoutePlannerStatusTranslate) {
	const modeLabels = itinerary.legs
		.filter(leg => !isMotisWalkingLeg(leg))
		.map(leg => getRoutePlannerTransitLegLabel(leg, mode => translate(`default:routes.RoutePlanner.results.mode_labels.${mode}`, '')))
		.join(', ');

	return [
		translate('default:routes.RoutePlanner.results.time_range', '', {
			end: formatMotisPlanTime(itinerary.endTime),
			start: formatMotisPlanTime(itinerary.startTime),
		}),
		formatMotisPlanDuration(itinerary.duration) || translate('default:routes.RoutePlanner.results.duration_unavailable', ''),
		modeLabels || translate('default:routes.RoutePlanner.results.walk_label', ''),
		translate('default:routes.RoutePlanner.results.transfers', '', { count: itinerary.transfers }),
		translate('default:routes.RoutePlanner.results.walking_time', '', { count: getItineraryWalkMinutes(itinerary) }),
	].join(', ');
}

/* * */

export interface GetRoutePlannerResultsStatusOptions {
	hasEndpoints: boolean
	isPlanning: boolean
	planError: null | string
	previousSelectedIndex: null | number
	previousVisibleCount: null | number
	selectedIndex: null | number
	selectedSummary: null | string
	selectionCameFromUser: boolean
	visibleCount: number
}

export type RoutePlannerResultsStatus = { count: number, type: 'result_count' } | { summary: string, type: 'selected' } | { type: 'idle' } | { type: 'no_results' } | { type: 'planning' };

/* * */

export function getRoutePlannerResultsStatus({ hasEndpoints, isPlanning, planError, previousSelectedIndex, previousVisibleCount, selectedIndex, selectedSummary, selectionCameFromUser, visibleCount }: GetRoutePlannerResultsStatusOptions): RoutePlannerResultsStatus {
	if (isPlanning) return { type: 'planning' };
	if (planError || !hasEndpoints) return { type: 'idle' };
	if (visibleCount === 0) return { type: 'no_results' };
	if (previousVisibleCount !== visibleCount) return { count: visibleCount, type: 'result_count' };
	if (!selectionCameFromUser && selectedSummary && previousSelectedIndex !== selectedIndex) return { summary: selectedSummary, type: 'selected' };

	return { type: 'idle' };
}
