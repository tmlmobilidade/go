'use client';

import { useStopsDetailFormContext } from '@/components/stops/detail/StopsDetailForm.context';
import { useStopsDetailData } from '@/components/stops/detail/use-stops-detail-data';
import { locationSlotOsmIds } from '@tmlmobilidade/go-types-locations';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Inline, useMeData, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
		if (!data?.location) return false;
		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.stops.actions.edit_name,
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
		<>
			<ValueDisplay
				footer={canUpdateName && <Inline onClick={openStopsDetailUpdateNameModal} dotted>{t('default:stops.detail.UpdateName.EditLink.label')}</Inline>}
				label={t('default:stops.detail.UpdateName.label')}
				value={data?.name ?? t('default:stops.shared.not_available')}
				variant="bordered"
			/>
			<ValueDisplay
				footer={canUpdateName && <Inline onClick={openStopsDetailUpdateNameModal} dotted>{t('default:stops.detail.UpdateName.EditLink.label')}</Inline>}
				label={t('default:stops.detail.UpdateName.label')}
				value={data?.short_name ?? t('default:stops.shared.not_available')}
				variant="bordered"
			/>
			<ValueDisplay
				footer={canUpdateName && <Inline onClick={openStopsDetailUpdateNameModal} dotted>{t('default:stops.detail.UpdateName.EditLink.label')}</Inline>}
				label={t('default:stops.detail.UpdateName.label')}
				value={data?.tts_name ?? t('default:stops.shared.not_available')}
				variant="bordered"
			/>
		</>
	);
}
