'use client';

import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { RoutePlannerLocationSelector } from '@/components/routes/RoutePlannerLocationSelector';
import { IconHome, IconSearch } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RoutePlannerTopSearch() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { isBottomSheetInStack } = useBottomSheet();
	const routePlannerContext = useRoutePlannerContext();
	const containerRef = useRef<HTMLDivElement>(null);

	//
	// B. Transform data

	const isRoutePlannerActive = isBottomSheetInStack('routes');
	const hasRouteInputContext = !!routePlannerContext.data.origin && !!routePlannerContext.data.destination;
	const shouldShowRouteInput = isRoutePlannerActive && (
		['itinerary-detail', 'results'].includes(routePlannerContext.data.view_mode)
		|| (routePlannerContext.data.view_mode === 'destination-search' && hasRouteInputContext)
	);

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
		<div ref={containerRef} className={styles.container}>
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
				<button
					className={styles.searchButton}
					onClick={routePlannerContext.actions.openDestinationSearch}
					type="button"
				>
					<IconSearch className={styles.searchIcon} size={24} />
					<span className={styles.placeholder}>
						{routePlannerContext.data.destination?.label || t('default:routes.RoutePlannerTopSearch.placeholder')}
					</span>
					<IconHome className={styles.homeIcon} size={24} />
				</button>
			)}
		</div>
	);

	//
}
