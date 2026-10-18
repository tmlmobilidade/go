'use client';

import styles from './styles.module.css';

import { LandingHeader } from '../../header/LandingHeader';
import { LandingMap } from '../../map/LandingMap';
import { LandingModulesInfrastructure } from '../../modules/LandingModulesInfrastructure';
import { LandingModulesIntro } from '../../modules/LandingModulesIntro';
import { LandingOverview } from '../../overview/LandingOverview';

/* * */

export function LandingPage() {
	return (
		<main className={styles.root}>
			<LandingHeader />
			<LandingMap />
			<LandingOverview />
			<LandingModulesIntro />
			<LandingModulesInfrastructure />
		</main>
	);
}
