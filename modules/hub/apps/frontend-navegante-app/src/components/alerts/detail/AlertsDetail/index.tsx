'use client';

import { AlertsDetailView } from '@/components/alerts/detail/AlertsDetailView';
import { useAlertsData } from '@/components/alerts/use-alerts-data';
import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { DetailUnavailable } from '@/components/common/display/DetailUnavailable';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { LoadingSection } from '@tmlmobilidade/ui';

/* * */

export function AlertsDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, pop } = useBottomSheet();
	const { data: alerts, error, isLoading } = useAlertsData();
	const isOpen = activeBottomSheet?.view === 'alerts-detail';
	const activeAlertId = isOpen ? activeBottomSheet?.entityId : null;

	const alert = activeAlertId ? alerts.find(candidate => candidate._id === activeAlertId) : null;

	//
	// B. Render components

	return (
		<BottomSheet
			onClose={pop}
			opened={isOpen}
			withOverlay={false}
			mapAware
			withCompactCloseButton
			withHeaderBackground
		>
			{activeAlertId && isLoading && <LoadingSection fullHeight />}
			{activeAlertId && !isLoading && error && <DetailUnavailable reason="error" />}
			{activeAlertId && !isLoading && !error && !alert && <DetailUnavailable reason="not-found" />}
			{activeAlertId && !isLoading && !error && alert && <AlertsDetailView alert={alert} />}
		</BottomSheet>
	);

	//
}
