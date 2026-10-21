'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, ListHeader, LoadingActivity } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { openAlertsExtractModal } from '../../extract/AlertsExtract.modal';
import { AlertsListFilterSearch } from '../filters/AlertsListFilterSearch';
import { useAlertsListData } from '../use-alerts-list-data';

/* * */

export function AlertsListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data, error, isLoading, isValidating, timestamp } = useAlertsListData();

	//
	// B. Render components

	return (
		<ListHeader
			activity={<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />}
			count={data?.length}
			search={<AlertsListFilterSearch />}
			title={t('alerts:list.AlertsListHeader.title')}
			actions={(
				<HasPermission action={PermissionCatalog.all.alerts.actions.read} scope={PermissionCatalog.all.alerts.scope}>
					<Button
						disabled={isLoading || isValidating || !!error || !data?.length}
						icon={<IconFileDownload size={20} />}
						label={t('alerts:list.AlertsListHeader.actions.extract.label')}
						onClick={openAlertsExtractModal}
					/>
				</HasPermission>
			)}
		/>
	);
}
