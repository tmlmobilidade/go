'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingOverviewI18n } from '../../overview/LandingOverviewI18n';
import { LandingOverviewMode } from '../../overview/LandingOverviewMode';
import { LandingOverviewTheme } from '../../overview/LandingOverviewTheme';
import { LandingSection } from '../../shared/LandingContainer';
import { LandingHeaderLogo } from '../LandingHeaderLogo';

/* * */

export function LandingHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<header className={styles.header}>
			<LandingSection>
				<div className={styles.row}>
					<LandingHeaderLogo />
					<div className={styles.preferences}>
						<LandingOverviewI18n />
						<LandingOverviewTheme />
						<LandingOverviewMode />
						<Button href={PAGE_ROUTES.core.LOGIN_LIST} label={t('landing:LandingHeader.login')} />
					</div>
				</div>
			</LandingSection>
		</header>
	);
}
