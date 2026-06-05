'use client';

import { ActionBarButton } from '@/components/common/action-bar/ActionBarButton';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { IconAlertTriangle, IconQuestionMark, IconSearch } from '@tabler/icons-react';
import { Spacer } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function ActionBar() {
	//

	//
	// A. Setup variables

	const { setActiveBottomSheet } = useBottomSheet();

	//
	// B. Render components

	return (
		<div className={styles.container}>

			<ActionBarButton
				icon={<IconQuestionMark size={30} />}
				onClick={() => setActiveBottomSheet({ view: 'help' })}
			/>

			<Spacer
				orientation="vertical"
				size="full"
			/>

			<ActionBarButton
				icon={<IconAlertTriangle size={28} />}
				onClick={() => setActiveBottomSheet({ view: 'alerts-list' })}
			/>

			<ActionBarButton
				icon={<IconSearch size={28} />}
				onClick={() => setActiveBottomSheet({ view: 'search' })}
			/>

			{/* <ActionBarButton
				icon={<IconLocation size={28} />}
				onClick={centerMapOnUserLocation}
			/> */}

		</div>
	);
}
