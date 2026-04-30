'use client';
/* * */

import { AlertsPublicListFilterBar } from '@/components/alerts/list/AlertsPublicListFilterBar';
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
			<AlertsPublicListFilterBar />
		</>
	);

	//
}
