'use client';

/* * */

import { Sidebar } from '@/components/app/sidebar/Sidebar';
import { AppWrapperHeader } from '@/components/app/topbar/AppWrapperHeader';
import { Loader } from '@/components/loaders/Loader';
import { useMeContext } from '@/contexts/Me.context';
import { type PropsWithChildren, Suspense } from 'react';

import styles from './styles.module.css';

import { AppWrapperLogo } from '../AppWrapperLogo';

/* * */

export function AppWrapper({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	//
	// B. Render components

	return (
		<Suspense fallback={<Loader size="xl" />}>
			<div className={styles.container}>
				<AppWrapperLogo />
				<AppWrapperHeader userName={meContext.data.user?.first_name} />
				<Sidebar />
				<div className={styles.content}>{children}</div>
			</div>
		</Suspense>
	);

	//
}
