'use client';

/* * */

import { ViewportHeader } from '@/components/viewport/ViewportHeader';
import { useAppReload } from '@/hooks/use-app-reload';
import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

export function Viewport({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	useAppReload();

	//
	// B. Render components

	return (
		<div className={styles.viewport}>
			<ViewportHeader />
			<div className={styles.content}>
				{children}
			</div>
		</div>
	);

	//
}
