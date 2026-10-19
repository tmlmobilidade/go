'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { LandingSection } from '../../shared/LandingContainer';
import { LandingInfoBlock } from '../../shared/LandingInfoBlock';
import { LandingOverviewLinks } from '../LandingOverviewLinks';

/* * */

export function LandingOverviewI18n() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<div>
			i18n
		</div>
	);
}
