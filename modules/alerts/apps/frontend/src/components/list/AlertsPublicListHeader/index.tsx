'use client';
/* * */

import { AlertsPublicListFilterBar } from '@/components/list/AlertsPublicListFilterBar';
import { Toolbar } from '@tmlmobilidade/ui';
import { Label } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListHeader() {
	//

	//
	// A. Setup Variables

	const { t } = useTranslation();

	//
	// B. Render Components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('default:alerts.public.list.header.title')}</Label>
			<AlertsPublicListFilterBar />
		</Toolbar>
	);

	//
}
