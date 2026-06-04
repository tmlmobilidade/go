'use client';

import { FloatingBarButton } from '@/components/viewport/FloatingBarButton';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';
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
				onClick={() => setActiveBottomSheet('help')}
			/>

			<FloatingBarButton
				icon={<IconAlertTriangle size={28} />}
				onClick={() => setActiveBottomSheet('alerts')}
			/>

			<FloatingBarButton
				icon={<IconSearch size={28} />}
				onClick={() => setActiveBottomSheet('search')}
			/>

		</div>
	);
}
