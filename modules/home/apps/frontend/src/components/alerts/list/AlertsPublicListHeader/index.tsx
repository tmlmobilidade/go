'use client';
/* * */

import { AlertsPublicListFilterBar } from '@/components/alerts/list/AlertsPublicListFilterBar';
import { Label, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<>
			<Toolbar>
				<Label size="lg" caps singleLine>{t('shared:home.alerts.public.list.header.title')}</Label>
			</Toolbar>
			<AlertsPublicListFilterBar />
		</>
	);

	//
}
