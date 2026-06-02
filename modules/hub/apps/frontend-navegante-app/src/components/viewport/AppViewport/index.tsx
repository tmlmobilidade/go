'use client';

import { FloatingHelpButton } from '@/components/viewport/FloatingHelpButton';
import { Navbar } from '@/components/viewport/Navbar';

import styles from './styles.module.css';

/* * */

export function AppViewport() {
	return (
		<>
			<div className={styles.viewport}>
				<Navbar />
			</div>
			<FloatingHelpButton />
		</>
	);
}
