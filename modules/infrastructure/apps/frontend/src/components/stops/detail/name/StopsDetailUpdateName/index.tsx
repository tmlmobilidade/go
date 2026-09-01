'use client';

import { hasPermissionResource } from '@tmlmobilidade/go-types-permissions';
import { Inline, useMeData, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useStopsDetailFormContext } from '../../StopsDetailForm.context';
import { useStopsDetailData } from '../../use-stops-detail-data';
import { openStopsDetailUpdateNameModal } from '../StopsDetailUpdateName.modal';

/* * */

export function StopsDetailUpdateName() {
	//

	//
	// A. Setup variables

	const { data } = useStopsDetailData();

	const { data: meData } = useMeData();

	const { capabilities } = useStopsDetailFormContext();

	//
	// B. Transform data

	const canUpdateName = useMemo(() => {
		const hasPermission = hasPermissionResource(meData?.permissions, {
			requiredPermission: { action: 'edit_name', scope: 'stops' },
			requiredValue: data?.municipality_id,
			resourceKey: 'municipality_ids',
		});
		return hasPermission && !capabilities.updateEnabled;
	}, [data?.municipality_id, meData?.permissions, capabilities.updateEnabled]);

	//
	// C. Render components

	return (
		<ValueDisplay
			footer={canUpdateName && <Inline onClick={openStopsDetailUpdateNameModal} dotted>Editar</Inline>}
			label="Nome Único da Paragem"
			value={data?.name ?? 'N/A'}
			variant="bordered"
		/>
	);
}
