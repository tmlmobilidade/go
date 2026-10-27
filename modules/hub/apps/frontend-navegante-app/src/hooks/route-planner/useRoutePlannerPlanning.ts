'use client';

import { useUserLocation } from '@/contexts/UserLocation.context';
import { useRoutePlannerOrigin } from '@/hooks/route-planner/useRoutePlannerOrigin';
import { useRoutePlannerPlanData } from '@/hooks/route-planner/useRoutePlannerPlanData';
import { type RoutePlannerContextState, type RoutePlannerPlanOptions } from '@/types/route-planner/context';
import { type RoutePlannerLocation, type RoutePlannerTravelTime } from '@/types/route-planner/models';
import { type PersistedActiveTrip, type PersistedRoute } from '@/utils/persistence/app-state';
import { type RoutePlannerState, type RoutePlannerStateAction } from '@/utils/route-planner/planning/state';
import { type Dispatch, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
	const { latestKnownOrigin, requestCurrentOrigin, resolveOrigin } = useRoutePlannerOrigin();
	const { isLoading: isPlanning, itineraries, requestPlan, reset: resetPlanRequest } = useRoutePlannerPlanData();
	const planRequestRef = useRef(0);
	const isMountedRef = useRef(false);
	const activeTripRestoreRequestRef = useRef(0);
	const [isResolvingCurrentLocation, setIsResolvingCurrentLocation] = useState(false);

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
		setIsResolvingCurrentLocation(false);
		resetPlanRequest();
		dispatch({ type: 'invalidate-plan' });
	}, [dispatch, resetPlanRequest]);

	// B. Plan routes

	const planRoute = useCallback(async (options: RoutePlannerPlanOptions = {}) => {
		const requestId = ++planRequestRef.current;
		const requestOrigin = options.origin === undefined ? origin : options.origin;
		const requestDestination = options.destination === undefined ? destination : options.destination;
		const requestTravelTime = options.travelTime ?? travelTime;
		setIsResolvingCurrentLocation(false);
		resetPlanRequest();
		dispatch({ type: 'restore-finished' });

		if (!requestOrigin || !requestDestination) {
			dispatch({ error: t('default:routes.RoutePlanner.errors.missing_locations'), type: 'plan-error' });
			return;
		}

		dispatch({ type: 'plan-started', viewMode: options.viewMode ?? 'results' });
		try {
			const usesCurrentLocation = requestOrigin.isCurrentLocation || requestDestination.isCurrentLocation;
			const resolvedOrigin = requestOrigin.isCurrentLocation ? latestKnownOrigin ?? requestOrigin : requestOrigin;
			const resolvedDestination = requestDestination.isCurrentLocation ? latestKnownOrigin ?? requestDestination : requestDestination;
			if (usesCurrentLocation && latestKnownOrigin) dispatch({ location: latestKnownOrigin, type: 'refresh-current-location' });
			const data = await requestPlan({ destination: resolvedDestination, origin: resolvedOrigin, travelTime: requestTravelTime });
			if (!isMountedRef.current || planRequestRef.current !== requestId) return;
			if (!data) throw new Error('Route plan returned no data');
			if (data.itineraries.length === 0) dispatch({ error: t('default:routes.RoutePlanner.errors.no_itineraries'), type: 'plan-error' });
		} catch {
			if (!isMountedRef.current || planRequestRef.current !== requestId) return;
			dispatch({ error: t('default:routes.RoutePlanner.errors.unknown'), type: 'plan-error' });
		} finally {
			if (isMountedRef.current && planRequestRef.current === requestId) setIsResolvingCurrentLocation(false);
		}
	}, [destination, dispatch, latestKnownOrigin, origin, requestPlan, resetPlanRequest, t, travelTime]);

	// C. Restore saved routes and active trips

	const restoreSessionRoute = useCallback((route: PersistedRoute) => {
		const requestId = ++planRequestRef.current;
		cancelActiveTripRestore();
		const savedTravelDate = new Date(route.travelTime.date);
		const mode = route.travelTime.mode !== 'now' && savedTravelDate.getTime() < Date.now() ? 'now' : route.travelTime.mode;
		const travelTime: RoutePlannerTravelTime = { date: mode === 'now' ? new Date() : savedTravelDate, mode };
		const usesCurrentLocation = route.originUsesCurrentLocation || route.destinationUsesCurrentLocation;
		resetPlanRequest();
		setIsResolvingCurrentLocation(usesCurrentLocation);
		dispatch({ destination: route.destination, origin: route.origin, pendingCurrentLocation: usesCurrentLocation, route, travelTime, type: 'restore-route' });

		void (async () => {
			try {
				const currentLocation = usesCurrentLocation ? await requestCurrentOrigin() : null;
				if (!isMountedRef.current || planRequestRef.current !== requestId) return;
				if (usesCurrentLocation && !currentLocation) {
					dispatch({ error: t('default:routes.RoutePlanner.errors.current_location_unavailable'), type: 'plan-error' });
					return;
				}
				const resolvedOrigin = route.originUsesCurrentLocation ? currentLocation : route.origin;
				const resolvedDestination = route.destinationUsesCurrentLocation ? currentLocation : route.destination;
				if (usesCurrentLocation) dispatch({ destination: resolvedDestination, origin: resolvedOrigin, pendingCurrentLocation: false, route, travelTime, type: 'restore-route' });
				if (!resolvedOrigin || !resolvedDestination) return;
				setIsResolvingCurrentLocation(false);
				const data = await requestPlan({ destination: resolvedDestination, origin: resolvedOrigin, travelTime });
				if (!isMountedRef.current || planRequestRef.current !== requestId) return;
				if (!data) throw new Error('Route plan returned no data');
				if (data.itineraries.length === 0) dispatch({ error: t('default:routes.RoutePlanner.errors.no_itineraries'), type: 'plan-error' });
				else dispatch({ itineraryCount: data.itineraries.length, route, type: 'restore-result' });
			} catch {
				if (!isMountedRef.current || planRequestRef.current !== requestId) return;
				dispatch({ error: t('default:routes.RoutePlanner.errors.unknown'), type: 'plan-error' });
			} finally {
				if (isMountedRef.current && planRequestRef.current === requestId) {
					setIsResolvingCurrentLocation(false);
					dispatch({ type: 'restore-finished' });
				}
			}
		})();
	}, [cancelActiveTripRestore, dispatch, requestCurrentOrigin, requestPlan, resetPlanRequest, t]);

	const restoreActiveTrip = useCallback((route: PersistedRoute, trip: PersistedActiveTrip) => {
		const requestId = ++activeTripRestoreRequestRef.current;
		planRequestRef.current += 1;
		setIsResolvingCurrentLocation(false);
		resetPlanRequest();
		dispatch({ origin: null, route, trip, type: 'restore-active-trip' });
		setTrackingMode('follow');
		void requestCurrentOrigin().then((freshOrigin) => {
			if (isMountedRef.current && activeTripRestoreRequestRef.current === requestId && freshOrigin) dispatch({ location: freshOrigin, type: 'set-origin' });
		});
	}, [dispatch, requestCurrentOrigin, resetPlanRequest, setTrackingMode]);

	// D. Return data and actions

	return useMemo(() => ({ cancelActiveTripRestore, invalidatePlanResult, isPlanning: isPlanning || isResolvingCurrentLocation, itineraries, latestKnownOrigin, planRoute, requestCurrentOrigin, resolveOrigin, restoreActiveTrip, restoreSessionRoute }), [cancelActiveTripRestore, invalidatePlanResult, isPlanning, isResolvingCurrentLocation, itineraries, latestKnownOrigin, planRoute, requestCurrentOrigin, resolveOrigin, restoreActiveTrip, restoreSessionRoute]);
}
