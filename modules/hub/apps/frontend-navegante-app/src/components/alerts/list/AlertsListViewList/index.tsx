/* * */

import { useAlertsListContext } from '@/components/alerts/list/AlertsList.context';
import { NoDataLabel } from '@/components/layout/NoDataLabel';
import { RegularListItem } from '@/components/layout/RegularListItem';
import { Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';
import { ViewportList } from 'react-viewport-list';

import { AlertListItem } from '../AlertsListItem';

/* * */

export function AlertsListViewList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	if (!alertsListContext.data.filtered.length) {
		return (
			<Section>
				<NoDataLabel text={t('default:alerts.AlertsListViewList.no_data')} withMinHeight />
			</Section>
		);
	}

	return (
		<Section padding="none">
			<ViewportList itemMargin={0} items={alertsListContext.data.filtered}>
				{item => (
					<RegularListItem key={item._id} href="#">
						<AlertListItem alertId={item._id} />
					</RegularListItem>
				)}
			</ViewportList>
		</Section>
	);
}
