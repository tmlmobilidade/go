'use client';

import { StopsDetailContextProvider } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailView } from '@/components/stops/detail/StopsDetailView';
import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsDetail() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();

	//
	// B. Render componentss

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'stops-detail'}
			size="half"
			title={t('default:stops.StopsDetail.title')}
		>
			<StopsDetailContextProvider stopId={activeBottomSheet?.entityId}>
				<StopsDetailView />
			</StopsDetailContextProvider>
		</BottomSheet>
	);
}
