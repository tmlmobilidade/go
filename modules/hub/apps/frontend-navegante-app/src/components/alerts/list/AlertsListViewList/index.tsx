/* * */

import { useAlertsListContext } from '@/components/alerts/list/AlertsList.context';
import { AlertsListGroup } from '@/components/alerts/list/AlertsListGroup';
import { NoDataLabel } from '@/components/common/display/NoDataLabel';
import { Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

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
			<AlertsListGroup />
		</Section>
	);
}
