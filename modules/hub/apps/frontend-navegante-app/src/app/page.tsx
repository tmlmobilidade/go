'use client';

import { AlertsDetail } from '@/components/alerts/detail/AlertsDetail';
import { ActionBar } from '@/components/common/action-bar/ActionBar';
import { BaseMap } from '@/components/common/base-map/BaseMap';
import { BaseMapOverlaysControl } from '@/components/common/base-map/BaseMapOverlaysControl';
import { AppStatePersistence } from '@/components/common/persistence/AppStatePersistence';
import { LinesDetail } from '@/components/lines/detail/LinesDetail';
import { LinesDetailContextProvider } from '@/components/lines/detail/LinesDetail.context';
import { RoutePlannerVehiclesCounter } from '@/components/routes/common/RoutePlannerVehiclesCounter';
import { RoutePlannerTopSearch } from '@/components/routes/input/RoutePlannerTopSearch';
import { RoutePlannerAnnouncerProvider } from '@/components/routes/navigation/RoutePlannerAnnouncer';
import { RoutePlannerLiveBar } from '@/components/routes/navigation/RoutePlannerLiveBar';
import { RoutePlanner } from '@/components/routes/planner/RoutePlanner';
import { RoutePlannerContextProvider } from '@/components/routes/RoutePlanner.context';
import { SearchDetail } from '@/components/search/SearchDetail';
import { StopsDetail } from '@/components/stops/detail/StopsDetail';
import { VehiclesDetail } from '@/components/vehicles/detail/VehiclesDetail';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { useColorScheme } from '@tmlmobilidade/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './page.module.css';

/* * */

export default function Page() {
	//

	//
	// A. Setup variables

	const colorScheme = useColorScheme();
	const { t } = useTranslation();
	const { activeBottomSheet } = useBottomSheet();
	const [isMapFiltersOpen, setIsMapFiltersOpen] = useState(false);
	const activeLineId = activeBottomSheet?.view === 'lines-detail' ? activeBottomSheet.entityId ?? null : null;

	//
	// B. Handle actions

	useEffect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.setAttribute('data-mode', colorScheme);
		document.documentElement.setAttribute('data-mantine-color-scheme', colorScheme);
	}, [colorScheme]);

	//
	// C. Render components

	return (
		<LinesDetailContextProvider lineId={activeLineId}>
			<RoutePlannerContextProvider>
				<RoutePlannerAnnouncerProvider>
					<AppStatePersistence isMapFiltersOpen={isMapFiltersOpen} setIsMapFiltersOpen={setIsMapFiltersOpen} />
					<main className={styles.main}>
						<h1 className={styles.visuallyHidden}>{t('default:layout.metadata.title')}</h1>
						<BaseMap />
						<RoutePlannerTopSearch />
						<BaseMapOverlaysControl onOpenedChange={setIsMapFiltersOpen} opened={isMapFiltersOpen} />
						{!isMapFiltersOpen && <ActionBar />}
						<VehiclesDetail />
						<LinesDetail />
						<StopsDetail />
						<AlertsDetail />
						<SearchDetail />
						<RoutePlanner />
						<RoutePlannerLiveBar />
						{!isMapFiltersOpen && <RoutePlannerVehiclesCounter />}
					</main>
				</RoutePlannerAnnouncerProvider>
			</RoutePlannerContextProvider>
		</LinesDetailContextProvider>
	);
}
