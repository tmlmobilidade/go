'use client';

/* * */

import { ViewportHeader } from '@/components/viewport/ViewportHeader';
import { useAppReload } from '@/hooks/use-app-reload';
import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

interface Props {
	title: string
}

/* * */

export function Viewport({ children, title }: PropsWithChildren<Props>) {
	//

	//
	// A. Setup variables

	useAppReload();

	//
	// B. Render components

	return (
		<div className={styles.viewport}>
			<ViewportHeader title={title} />
			<div className={styles.content}>
				{children}
			</div>
		</div>
	);

	//
}
