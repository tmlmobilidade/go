'use client';

import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { FloatingBarButton } from '@/components/viewport/FloatingBarButton';
import { IconAlertTriangle, IconQuestionMark, IconSearch } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export function FloatingBar() {
	//

	//
	// A. Setup variables

	const { setActiveBottomSheet } = useBottomSheet();

	//
	// B. Render components

	return (
		<div className={styles.container}>

			<FloatingBarButton
				icon={<IconQuestionMark size={30} />}
				onClick={() => setActiveBottomSheet({ view: 'help' })}
			/>

			<FloatingBarButton
				icon={<IconAlertTriangle size={28} />}
				onClick={() => setActiveBottomSheet({ view: 'alerts-list' })}
			/>

			<FloatingBarButton
				icon={<IconSearch size={28} />}
				onClick={() => setActiveBottomSheet({ view: 'search' })}
			/>

		</div>
	);
}
