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

	const currentViewOptions = [
		{ label: t('default:alerts.AlertsListToolbar.by_date.current', '', { count: alertsListContext.counters.by_date.current }), value: 'current' },
		{ label: t('default:alerts.AlertsListToolbar.by_date.future', '', { count: alertsListContext.counters.by_date.future }), value: 'future' },
		{ label: t('default:alerts.AlertsListToolbar.filters.by_current_view.map'), value: 'map' },
	];

	//
	// C. Render components

	return (
		<Section gap="md">
			<SearchInput onChange={alertsListContext.filters.search.set} value={alertsListContext.filters.search.value} />
			<SegmentedControl data={currentViewOptions} onChange={alertsListContext.actions.toggle} value={alertsListContext.view.current} w="100%" fullWidth />
		</Section>
	);
}
