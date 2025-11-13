/* * */

import { type PropsWithChildren, Suspense } from 'react';

import styles from './styles.module.css';

import { Loader } from '../../loaders';
import { Sidebar } from '../../sidebar';
import { Topbar } from '../../topbar';
import { AppWrapperLogo } from '../AppWrapperLogo';

/* * */

export function AppWrapper({ children }: PropsWithChildren) {
	return (
		<Suspense fallback={<Loader size="xl" />}>
			<div className={styles.container}>
				<AppWrapperLogo />
				<Topbar />
				<Sidebar />
				<div className={styles.content}>{children}</div>
			</div>
		</Suspense>
	);
}
