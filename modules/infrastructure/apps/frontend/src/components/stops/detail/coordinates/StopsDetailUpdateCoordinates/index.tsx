'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Inline, useMeData, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStopsDetailFormContext } from '../../StopsDetailForm.context';
import { useStopsDetailData } from '../../use-stops-detail-data';
import { openStopsDetailUpdateCoordinatesModal } from '../StopsDetailUpdateCoordinates.modal';

/* * */

export function StopsDetailUpdateCoordinates() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data } = useStopsDetailData();

	const { data: meData } = useMeData();

	const { capabilities } = useStopsDetailFormContext();

	//
	// B. Setup flags

	const canUpdateCoordinates = useMemo(() => {
		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.stops.actions.edit_coordinates,
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
			footer={canUpdateCoordinates && <Inline onClick={openStopsDetailUpdateCoordinatesModal} dotted>{t('default:stops.detail.UpdateCoordinates.EditLink.label')}</Inline>}
			label={t('default:stops.detail.UpdateCoordinates.label')}
			value={`${data?.latitude ?? t('default:stops.shared.not_available')}, ${data?.longitude ?? t('default:stops.shared.not_available')}`}
			variant="bordered"
		/>
	);
}
