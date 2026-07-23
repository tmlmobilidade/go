'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { AlertsDetailView } from '@/components/alerts/detail/AlertsDetailView';
import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsDetail() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();
	const alertsContext = useAlertsContext();
	const { t } = useTranslation();

	const alert = activeBottomSheet?.entityId ? alertsContext.actions.getAlertById(activeBottomSheet.entityId) : null;

	//
	// B. Render components

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'alerts-detail'}
			title={t('default:alerts.AlertsDetail.title')}
		>
			{activeBottomSheet?.entityId && alert && (
				<AlertsDetailView alert={alert} />
			)}
		</BottomSheet>
	);

	//
}
