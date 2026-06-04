'use client';

import { AlertsListContextProvider } from '@/components/alerts/list/AlertsList.context';
import { AlertsListToolbar } from '@/components/alerts/list/AlertsListToolbar';
import { AlertsListView } from '@/components/alerts/list/AlertsListView';
import { BottomSheet } from '@/components/viewport/BottomSheet';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';
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
			opened={activeBottomSheet?.view === 'alerts'}
			title={t('default:alerts.AlertsList.title')}
		>
			<AlertsListContextProvider>
				<AlertsListToolbar />
				<AlertsListView />
			</AlertsListContextProvider>
		</BottomSheet>
	);
}
