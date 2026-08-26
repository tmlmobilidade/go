/* * */

import { type PerformanceComparison, type PerformancePeriodSelection, type PerformanceScreen, type PeriodPreset } from '@/utils/performance-periods';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';

/* * */

const PERIOD_PRESETS: PeriodPreset[] = ['custom', 'last-7-days', 'month-to-date', 'today', 'yesterday'];
const COMPARISONS: PerformanceComparison[] = ['comparable-weekdays', 'previous-period', 'previous-week', 'same-period-last-month'];
const LINE_ID_PLACEHOLDER = '__line_id__';
const PERFORMANCE_PAGE_BASE_SEGMENTS = getPathSegments(PAGE_ROUTES.performance.BASE);
const PERFORMANCE_API_BASE_SEGMENTS = getPathSegments(API_ROUTES.performance.BASE);
const LINE_DETAIL_ROUTE_SEGMENTS = withoutPrefixSegments(
	getPathSegments(API_ROUTES.performance.NETWORK_LINES_DETAIL(LINE_ID_PLACEHOLDER)),
	PERFORMANCE_API_BASE_SEGMENTS,
);

/* * */

export function getPerformanceScreen(pathname: string): PerformanceScreen {
	return pathname === '/' || pathsMatch(pathname, PAGE_ROUTES.performance.BASE) ? 'pulse' : 'analysis';
}

export function isLineDetailPath(pathname: string) {
	const pathnameSegments = withoutPrefixSegments(getPathSegments(pathname), PERFORMANCE_PAGE_BASE_SEGMENTS);
	if (pathnameSegments.length !== LINE_DETAIL_ROUTE_SEGMENTS.length) return false;
	return LINE_DETAIL_ROUTE_SEGMENTS.every((segment, index) => (
		segment === LINE_ID_PLACEHOLDER ? Boolean(pathnameSegments[index]) : pathnameSegments[index] === segment
	));
}

function getPathSegments(pathOrUrl: string) {
	const pathname = pathOrUrl.startsWith('http') ? new URL(pathOrUrl).pathname : pathOrUrl;
	return pathname.split('/').filter(Boolean).map(decodeURIComponent);
}

function withoutPrefixSegments(segments: string[], prefixSegments: string[]) {
	const includesPrefix = prefixSegments.every((segment, index) => segments[index] === segment);
	return includesPrefix ? segments.slice(prefixSegments.length) : segments;
}

function pathsMatch(pathname: string, route: string) {
	const pathnameSegments = getPathSegments(pathname);
	const routeSegments = getPathSegments(route);
	return pathnameSegments.length === routeSegments.length && routeSegments.every((segment, index) => pathnameSegments[index] === segment);
}

export function getDefaultPerformancePeriod(screen: PerformanceScreen): PerformancePeriodSelection {
	return screen === 'pulse' ? { preset: 'today' } : { preset: 'yesterday' };
}

export function getDefaultPerformanceComparison(screen: PerformanceScreen): PerformanceComparison {
	return screen === 'pulse' ? 'comparable-weekdays' : 'previous-period';
}

export function isPeriodPreset(value: null | string): value is PeriodPreset {
	return PERIOD_PRESETS.includes(value as PeriodPreset);
}

export function isPerformanceComparison(value: null | string): value is PerformanceComparison {
	return COMPARISONS.includes(value as PerformanceComparison);
}
