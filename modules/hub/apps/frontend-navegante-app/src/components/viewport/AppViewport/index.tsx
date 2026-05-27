<<<<<<< HEAD
'use client';
=======
/* * */
>>>>>>> prd

import { Navbar } from '@/components/viewport/Navbar';
import { Topbar } from '@/components/viewport/Topbar';

import styles from './styles.module.css';

/* * */

export function AppViewport() {
	return (
		<div className={styles.viewport}>
			<Topbar />
			<Navbar />
		</div>
	);
}
