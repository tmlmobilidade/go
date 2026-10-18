'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, Section, Spacer } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingSection } from '../../shared/LandingContainer';
import { LandingHeaderLogo } from '../LandingHeaderLogo';

/* * */

export function LandingHeader() {
	//

	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

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
