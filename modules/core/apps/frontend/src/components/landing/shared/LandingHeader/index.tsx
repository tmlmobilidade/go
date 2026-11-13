'use client';

import styles from './styles.module.css';

import { LandingSection } from '../../shared/LandingContainer';
import { LandingHeaderLogo } from '../LandingHeaderLogo';

/* * */

export function LandingHeader() {
	return (
		<header className={styles.header}>
			<LandingSection>
				<LandingHeaderLogo />
			</LandingSection>
		</header>
	);
}
