'use client';

/* * */

import { AppSidebar } from '@/components/app/sidebar/AppSidebar';
import { AppTopbar } from '@/components/app/topbar/AppTopbar';
import { AppWrapperLogo } from '@/components/app/wrapper/AppWrapperLogo';
import { Loader } from '@/components/loaders/Loader';
import { type PropsWithChildren, Suspense } from 'react';

import styles from './styles.module.css';

/* * */

export function AppWrapper({ children }: PropsWithChildren) {
	return (
		<Suspense fallback={<Loader size="xl" />}>
			<div className={styles.container}>
				<AppWrapperLogo />
				<AppTopbar />
				<AppSidebar />
				<div className={styles.content}>{children}</div>
			</div>
		</Suspense>
	);
}
