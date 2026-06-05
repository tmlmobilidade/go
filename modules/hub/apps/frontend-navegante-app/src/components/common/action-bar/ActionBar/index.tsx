'use client';

import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { ActionBarButton } from '@/components/common/action-bar/ActionBarButton';
import { IconAlertTriangle, IconQuestionMark, IconSearch } from '@tabler/icons-react';

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

			<ActionBarButton
				icon={<IconAlertTriangle size={28} />}
				onClick={() => setActiveBottomSheet({ view: 'alerts-list' })}
			/>

			<ActionBarButton
				icon={<IconSearch size={28} />}
				onClick={() => setActiveBottomSheet({ view: 'search' })}
			/>

		</div>
	);
}
