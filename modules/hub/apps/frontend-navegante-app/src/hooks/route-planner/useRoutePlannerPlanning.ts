'use client';

import { useUserLocation } from '@/contexts/UserLocation.context';
import { useRoutePlannerOrigin } from '@/hooks/route-planner/useRoutePlannerOrigin';
import { useRoutePlannerPlanData } from '@/hooks/route-planner/useRoutePlannerPlanData';
import { type RoutePlannerContextState, type RoutePlannerPlanOptions } from '@/types/route-planner/context';
import { type RoutePlannerLocation, type RoutePlannerTravelTime } from '@/types/route-planner/models';
import { type PersistedActiveTrip, type PersistedRoute } from '@/utils/persistence/app-state';
import { type RoutePlannerState, type RoutePlannerStateAction } from '@/utils/route-planner/planning/state';
import { type Dispatch, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface UseRoutePlannerPlanningOptions {
	dispatch: Dispatch<RoutePlannerStateAction>
	state: Pick<RoutePlannerState, 'destination' | 'origin' | 'travelTime'>
}

interface UseRoutePlannerPlanningReturnType extends ReturnType<typeof useRoutePlannerOrigin> {
	cancelActiveTripRestore: () => void
	invalidatePlanResult: () => void
	isPlanning: boolean
	itineraries: RoutePlannerContextState['data']['itineraries']
	planRoute: (options?: RoutePlannerPlanOptions) => Promise<void>
	restoreActiveTrip: (route: PersistedRoute, trip: PersistedActiveTrip) => void
	restoreSessionRoute: (route: PersistedRoute) => void
}

/* * */

export function useRoutePlannerPlanning({ dispatch, state: { destination, origin, travelTime } }: UseRoutePlannerPlanningOptions): UseRoutePlannerPlanningReturnType {
	// A. Setup data and request lifetimes

	const { t } = useTranslation();
	const { actions: { setTrackingMode } } = useUserLocation();
	const { cachedOrigin, requestCurrentOrigin, resolveOrigin } = useRoutePlannerOrigin();
	const { isLoading: isPlanning, itineraries, requestPlan, reset: resetPlanRequest } = useRoutePlannerPlanData();
	const planRequestRef = useRef(0);
	const isMountedRef = useRef(false);
	const activeTripRestoreRequestRef = useRef(0);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const cancelActiveTripRestore = useCallback(() => {
		activeTripRestoreRequestRef.current += 1;
	}, []);

	const invalidatePlanResult = useCallback(() => {
		planRequestRef.current += 1;
		resetPlanRequest();
		dispatch({ type: 'invalidate-plan' });
	}, [dispatch, resetPlanRequest]);

	// B. Plan routes

	const planRoute = useCallback(async (options: RoutePlannerPlanOptions = {}) => {
		const requestId = ++planRequestRef.current;
		const requestOrigin = options.origin === undefined ? origin : options.origin;
		const requestDestination = options.destination === undefined ? destination : options.destination;
		const requestTravelTime = options.travelTime ?? travelTime;
		resetPlanRequest();
		dispatch({ type: 'restore-finished' });

		if (!requestOrigin || !requestDestination) {
			dispatch({ error: t('default:routes.RoutePlanner.errors.missing_locations'), type: 'plan-error' });
			return;
		}

		dispatch({ type: 'plan-started', viewMode: options.viewMode ?? 'results' });
		try {
			const data = await requestPlan({ destination: requestDestination, origin: requestOrigin, travelTime: requestTravelTime });
			if (!isMountedRef.current || planRequestRef.current !== requestId) return;
			if (!data) throw new Error('Route plan returned no data');
			if (data.itineraries.length === 0) dispatch({ error: t('default:routes.RoutePlanner.errors.no_itineraries'), type: 'plan-error' });
		} catch {
			if (!isMountedRef.current || planRequestRef.current !== requestId) return;
			dispatch({ error: t('default:routes.RoutePlanner.errors.unknown'), type: 'plan-error' });
		}
	}, [destination, dispatch, origin, requestPlan, resetPlanRequest, t, travelTime]);

	// C. Restore saved routes and active trips

	const restoreSessionRoute = useCallback(function restoreSessionRoute(route: PersistedRoute, currentOrigin?: RoutePlannerLocation) {
		const requestId = ++planRequestRef.current;
		cancelActiveTripRestore();
		const savedTravelDate = new Date(route.travelTime.date);
		const mode = route.travelTime.mode !== 'now' && savedTravelDate.getTime() < Date.now() ? 'now' : route.travelTime.mode;
		const travelTime: RoutePlannerTravelTime = { date: mode === 'now' ? new Date() : savedTravelDate, mode };
		const currentLocation = currentOrigin ?? cachedOrigin;
		const origin = route.originUsesCurrentLocation ? currentLocation : route.origin;
		const destination = route.destinationUsesCurrentLocation ? currentLocation : route.destination;
		const pendingCurrentLocation = (route.originUsesCurrentLocation && !origin) || (route.destinationUsesCurrentLocation && !destination);
		resetPlanRequest();
		dispatch({ destination, origin, pendingCurrentLocation, route, travelTime, type: 'restore-route' });

		if (!origin || !destination) {
			if (pendingCurrentLocation) {
				void requestCurrentOrigin().then((freshOrigin) => {
					if (!isMountedRef.current || planRequestRef.current !== requestId) return;
					if (freshOrigin) restoreSessionRoute(route, freshOrigin);
					else dispatch({ type: 'restore-finished' });
				});
			}
			return;
		}

		void requestPlan({ destination, origin, travelTime }).then((data) => {
			if (!isMountedRef.current || planRequestRef.current !== requestId) return;
			if (!data) throw new Error('Route plan returned no data');
			if (data.itineraries.length === 0) {
				dispatch({ error: t('default:routes.RoutePlanner.errors.no_itineraries'), type: 'plan-error' });
				return;
			}
			dispatch({ itineraryCount: data.itineraries.length, route, type: 'restore-result' });
		}).catch(() => {
			if (!isMountedRef.current || planRequestRef.current !== requestId) return;
			dispatch({ error: t('default:routes.RoutePlanner.errors.unknown'), type: 'plan-error' });
		}).finally(() => {
			if (!isMountedRef.current || planRequestRef.current !== requestId) return;
			dispatch({ type: 'restore-finished' });
		});
	}, [cachedOrigin, cancelActiveTripRestore, dispatch, requestCurrentOrigin, requestPlan, resetPlanRequest, t]);

	const restoreActiveTrip = useCallback((route: PersistedRoute, trip: PersistedActiveTrip) => {
		const requestId = ++activeTripRestoreRequestRef.current;
		planRequestRef.current += 1;
		resetPlanRequest();
		dispatch({ origin: cachedOrigin, route, trip, type: 'restore-active-trip' });
		setTrackingMode('follow');
		void requestCurrentOrigin().then((freshOrigin) => {
			if (isMountedRef.current && activeTripRestoreRequestRef.current === requestId && freshOrigin) dispatch({ location: freshOrigin, type: 'set-origin' });
		});
	}, [cachedOrigin, dispatch, requestCurrentOrigin, resetPlanRequest, setTrackingMode]);

	// D. Return data and actions

	return useMemo(() => ({ cachedOrigin, cancelActiveTripRestore, invalidatePlanResult, isPlanning, itineraries, planRoute, requestCurrentOrigin, resolveOrigin, restoreActiveTrip, restoreSessionRoute }), [cachedOrigin, cancelActiveTripRestore, invalidatePlanResult, isPlanning, itineraries, planRoute, requestCurrentOrigin, resolveOrigin, restoreActiveTrip, restoreSessionRoute]);
}
