'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { AlertsDetailView } from '@/components/alerts/detail/AlertsDetailView';
import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';

/* * */

export function AlertsDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();
	const alertsContext = useAlertsContext();

	const alert = activeBottomSheet?.entityId ? alertsContext.actions.getAlertById(activeBottomSheet.entityId) : null;

	//
	// B. Render components

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'alerts-detail'}
			title="Alerta"
		>
			{activeBottomSheet?.entityId && alert && (
				<AlertsDetailView alert={alert} />
			)}
		</BottomSheet>
	);

	//
}
