'use client';

import { FloatingBarButton } from '@/components/viewport/FloatingBarButton';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';
import { IconAlertTriangle, IconQuestionMark, IconSearch } from '@tabler/icons-react';
import { Spacer } from '@tmlmobilidade/ui';

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

			<Spacer size="full" />

			<FloatingBarButton
				icon={<IconQuestionMark size={30} />}
				onClick={() => setActiveBottomSheet('help')}
			/>

			<FloatingBarButton
				icon={<IconAlertTriangle size={24} />}
				onClick={() => setActiveBottomSheet('alerts')}
			/>

			<FloatingBarButton
				icon={<IconSearch size={24} />}
				onClick={() => setActiveBottomSheet('search')}
			/>

		</div>
	);
}
