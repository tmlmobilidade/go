'use client';

import { hasPermissionResource } from '@tmlmobilidade/go-types-permissions';
import { Inline, useMeData, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useStopsDetailFormContext } from '../../StopsDetailForm.context';
import { useStopsDetailData } from '../../use-stops-detail-data';
import { openStopsDetailUpdateCoordinatesModal } from '../StopsDetailUpdateCoordinates.modal';

/* * */

export function StopsDetailUpdateCoordinates() {
	//

	//
	// A. Setup variables

	const { data } = useStopsDetailData();

	const { data: meData } = useMeData();

	const { capabilities } = useStopsDetailFormContext();

	//
	// B. Transform data

	const canUpdateCoordinates = useMemo(() => {
		const hasPermission = hasPermissionResource(meData?.permissions, {
			requiredPermission: { action: 'edit_coordinates', scope: 'stops' },
			requiredValue: data?.municipality_id,
			resourceKey: 'municipality_ids',
		});
		return hasPermission && !capabilities.updateEnabled;
	}, [data?.municipality_id, meData?.permissions, capabilities.updateEnabled]);

	//
	// C. Render components

	return (
		<ValueDisplay
			footer={canUpdateCoordinates && <Inline onClick={openStopsDetailUpdateCoordinatesModal} dotted>Editar</Inline>}
			label="Coordenadas"
			value={`${data?.latitude ?? 'N/A'}, ${data?.longitude ?? 'N/A'}`}
			variant="bordered"
		/>
	);
}
