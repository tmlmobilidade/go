'use client';

import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { RoutePlannerLocationSelector } from '@/components/routes/RoutePlannerLocationSelector';
import { getLastOmniSearchQuery, subscribeToOmniSearchQuery } from '@/components/search/OmniSearch';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RoutePlannerTopSearch() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { setActiveBottomSheet } = useBottomSheet();
	const routePlannerContext = useRoutePlannerContext();
	const containerRef = useRef<HTMLDivElement>(null);
	const lastOmniSearchQuery = useSyncExternalStore(subscribeToOmniSearchQuery, getLastOmniSearchQuery, getLastOmniSearchQuery);

	//
	// B. Transform data

	const hasRouteInputContext = !!routePlannerContext.data.origin && !!routePlannerContext.data.destination;
	const shouldShowRouteInput = (
		['itinerary-detail', 'results'].includes(routePlannerContext.data.view_mode)
		|| (routePlannerContext.data.view_mode === 'destination-search' && hasRouteInputContext)
	);
	const searchLabel = lastOmniSearchQuery.trim() || t('default:action-bar.ActionBar.search.label');

	//
	// C. Handle effects

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const element = containerRef.current;
		if (!element) return;

		const updateFloatingControlsTop = () => {
			const rect = element.getBoundingClientRect();
			document.documentElement.style.setProperty('--route-planner-floating-controls-top', `${Math.ceil(rect.bottom + 14)}px`);
		};

		updateFloatingControlsTop();

		const resizeObserver = new ResizeObserver(updateFloatingControlsTop);
		resizeObserver.observe(element);
		window.addEventListener('resize', updateFloatingControlsTop);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('resize', updateFloatingControlsTop);
			document.documentElement.style.removeProperty('--route-planner-floating-controls-top');
		};
	}, [shouldShowRouteInput]);

	//
	// D. Handle actions

	const handleOriginClick = () => {
		routePlannerContext.actions.openLocationSearch('origin');
	};

	const handleDestinationClick = () => {
		routePlannerContext.actions.openLocationSearch('destination');
	};

	//
	// E. Render components

	return (
		<div className={styles.container} ref={containerRef}>
			{shouldShowRouteInput && (
				<div className={styles.routeInputWrapper}>
					<RoutePlannerLocationSelector
						destination={routePlannerContext.data.destination}
						onDestinationClick={handleDestinationClick}
						onOriginClick={handleOriginClick}
						onSwap={routePlannerContext.actions.swapLocations}
						origin={routePlannerContext.data.origin}
					/>
				</div>
			)}

			{!shouldShowRouteInput && (
				<button className={styles.searchButton} onClick={() => setActiveBottomSheet({ view: 'search' })} type="button">
					<IconSearch className={styles.searchIcon} size={24} />
					<span className={styles.placeholder}>{searchLabel}</span>
				</button>
			)}
		</div>
	);

	//
}
