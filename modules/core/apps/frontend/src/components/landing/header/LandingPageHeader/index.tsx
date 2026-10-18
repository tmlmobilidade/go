'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, Spacer } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingPageHeaderLogo } from '../LandingPageHeaderLogo';

/* * */

export function LandingPageHeader() {
	//

	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<header className={styles.header}>
			<LandingPageHeaderLogo />
			<Spacer orientation="horizontal" size="full" />
			<Button href={PAGE_ROUTES.core.LOGIN_LIST} label={t('unauthenticated:LandingPage.login')} variant="primary" />
		</header>
	);
}
