'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Inline, useMeData, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStopsDetailFormContext } from '../../StopsDetailForm.context';
import { useStopsDetailData } from '../../use-stops-detail-data';
import { openStopsDetailUpdateNameModal } from '../StopsDetailUpdateName.modal';

/* * */

export function StopsDetailUpdateName() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data } = useStopsDetailData();

	const { data: meData } = useMeData();

	const { capabilities } = useStopsDetailFormContext();

	//
	// B. Setup flags

	const canUpdateName = useMemo(() => {
		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.stops.actions.edit_name,
			permissions: meData?.permissions,
			resource_key: 'municipality_ids',
			scope: PermissionCatalog.all.stops.scope,
			value: data?.municipality_id,
		});
		return hasPermission && !capabilities.updateEnabled;
	}, [data?.municipality_id, meData?.permissions, capabilities.updateEnabled]);

	//
	// C. Render components

	return (
		<ValueDisplay
			footer={canUpdateName && <Inline onClick={openStopsDetailUpdateNameModal} dotted>{t('default:stops.detail.UpdateName.EditLink.label')}</Inline>}
			label={t('default:stops.detail.UpdateName.label')}
			value={data?.name ?? t('default:stops.shared.not_available')}
			variant="bordered"
		/>
	);
}
