'use client';

import styles from './styles.module.css';

import { LandingMapPreview } from '../../map/LandingMapPreview';
import { LandingModules } from '../../modules/LandingModules';
import { LandingOverview } from '../../overview/LandingOverview';
import { LandingFooter } from '../LandingFooter';
import { LandingHeader } from '../LandingHeader';

/* * */

export function LandingPage() {
	return (
		<main className={styles.root}>
			<LandingHeader />
			<LandingMapPreview />
			<LandingOverview />
			<LandingModules />
			<LandingFooter />
		</main>
	);
}
