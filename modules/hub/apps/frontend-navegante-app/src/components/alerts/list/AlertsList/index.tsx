'use client';

import { AlertsListContextProvider } from '@/components/alerts/list/AlertsList.context';
import { AlertsListToolbar } from '@/components/alerts/list/AlertsListToolbar';
import { AlertsListView } from '@/components/alerts/list/AlertsListView';
import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();

	//
	// A. Render components

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'alerts-list'}
			title={t('default:alerts.AlertsList.title')}
		>
			<AlertsListContextProvider>
				<AlertsListToolbar />
				<AlertsListView />
			</AlertsListContextProvider>
		</BottomSheet>
	);
}
