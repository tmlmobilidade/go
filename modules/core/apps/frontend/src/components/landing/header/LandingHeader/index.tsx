'use client';

import { Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { LandingSection } from '../../shared/LandingContainer';
import { LandingHeaderLogo } from '../LandingHeaderLogo';

/* * */

export function LandingHeader() {
	return (
		<header className={styles.header}>
			<LandingSection>
				<Section flexDirection="row">
					<LandingHeaderLogo />
				</Section>
			</LandingSection>
		</header>
	);
}
