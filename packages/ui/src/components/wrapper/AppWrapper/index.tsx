'use client';

import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

import { useLayoutContext } from '../../../contexts/Layout.context';
import { Sidebar } from '../../sidebar/Sidebar';
import { AppWrapperBanner } from '../AppWrapperBanner';

/* * */

export function AppWrapper({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const layoutContext = useLayoutContext();

	//
	// B. Render components

	return (
		<div className={styles.root}>
			{!layoutContext.data.active_fullscreen && (
				<Sidebar />
			)}
			<div className={styles.content}>
				<AppWrapperBanner />
				{children}
			</div>
		</div>
	);
}
