'use client';

import { useStopsDetailFormContext } from '@/components/stops/detail/StopsDetailForm.context';
import { useStopsDetailData } from '@/components/stops/detail/use-stops-detail-data';
import { locationSlotOsmIds } from '@tmlmobilidade/go-types-locations';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Inline, useMeData, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
		if (!data?.location) return false;
		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.stops.actions.edit_coordinates,
			permissions: meData?.permissions,
			resource_key: 'location_ids',
			scope: PermissionCatalog.all.stops.scope,
			value: locationSlotOsmIds(data.location),
		});
		return hasPermission && !capabilities.updateEnabled;
	}, [data?.location, meData?.permissions, capabilities.updateEnabled]);

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
