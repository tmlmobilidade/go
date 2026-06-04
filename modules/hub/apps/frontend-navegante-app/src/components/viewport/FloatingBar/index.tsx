'use client';

import { FloatingBarButton } from '@/components/viewport/FloatingBarButton';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';
import { IconQuestionMark, IconSearch } from '@tabler/icons-react';

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
				icon={<IconSearch size={24} />}
				onClick={() => setActiveBottomSheet('search')}
			/>
			<FloatingBarButton
				icon={<IconQuestionMark size={30} />}
				onClick={() => setActiveBottomSheet('help')}
			/>
		</div>
	);
}
