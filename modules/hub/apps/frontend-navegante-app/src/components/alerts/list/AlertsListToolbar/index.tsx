'use client';

import { useAlertsListContext } from '@/components/alerts/list/AlertsList.context';
import { SegmentedControl } from '@mantine/core';
import { SearchInput, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsListToolbar() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertsListContext = useAlertsListContext();

	//
	// B. Transform data

	const byCurrentStatusOptions = [
		{ label: t('default:alerts.AlertsListToolbar.by_date.current'), value: 'current' },
		{ label: t('default:alerts.AlertsListToolbar.by_date.future'), value: 'future' },
		{ label: t('default:alerts.AlertsListToolbar.by_date.map'), value: 'map' },
	];

	//
	// C. Render components

	return (
		<Section>
			<SearchInput onChange={alertsListContext.filters.search.set} value={alertsListContext.filters.search.value} />
		</Section>
	);
}
