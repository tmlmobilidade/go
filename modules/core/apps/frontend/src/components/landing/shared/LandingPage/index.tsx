'use client';

import styles from './styles.module.css';

import { LandingMap } from '../../map/LandingMap';
import { LandingModules } from '../../modules/LandingModules';
import { LandingOverview } from '../../overview/LandingOverview';
import { LandingHeader } from '../LandingHeader';

/* * */

export function LandingPage() {
	return (
		<main className={styles.root}>
			<LandingHeader />
			<LandingMap />
			<LandingOverview />
			<LandingModules />
		</main>
	);
}
