'use client';

/* * */

import { type PropsWithChildren, Suspense } from 'react';

import styles from './styles.module.css';

import { useLayoutContext } from '../../../contexts/Layout.context';
import { Loader } from '../../loaders/Loader';
import { Sidebar } from '../../sidebar/Sidebar';
import { Topbar } from '../../topbar/Topbar';
import { AppWrapperLogo } from '../AppWrapperLogo';

/* * */

export function AppWrapper({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const layoutContext = useLayoutContext();

	//
	// B. Render components

	if (layoutContext.data.active_fullscreen) {
		return (
			<Suspense fallback={<Loader />}>
				<div className={styles.container}>
					<div className={styles.content}>{children}</div>
				</div>
			</Suspense>
		);
	}

	return (
		<Suspense fallback={<Loader />}>
			<div className={styles.container}>
				<AppWrapperLogo />
				<Topbar />
				<Sidebar />
				<div className={styles.content}>{children}</div>
			</div>
		</Suspense>
	);

	//
}
