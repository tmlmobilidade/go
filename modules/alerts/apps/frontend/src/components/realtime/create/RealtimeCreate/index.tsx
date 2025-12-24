'use client';

/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { RealtimeCreateHeader } from '@/components/realtime/create/RealtimeCreateHeader';
import { RealtimeCreateStepCause } from '@/components/realtime/create/RealtimeCreateStepCause';
import { RealtimeCreateStepEffect } from '@/components/realtime/create/RealtimeCreateStepEffect';
import { RealtimeCreateStepRidesFilters } from '@/components/realtime/create/RealtimeCreateStepRidesFilters';
import { RealtimeCreateStepRidesSelection } from '@/components/realtime/create/RealtimeCreateStepRidesSelection';
import { RealtimeCreateStepRidesSelectionControls } from '@/components/realtime/create/RealtimeCreateStepRidesSelectionControls';
import { RealtimeCreateStepSummary } from '@/components/realtime/create/RealtimeCreateStepSummary';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { NoDataLabel, Pane, useMeContext } from '@tmlmobilidade/ui';

/* * */

export function RealtimeCreate() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const realtimeCreateContext = useRealtimeCreateContext();

	const hasPermissionCreate = meContext.actions.hasPermission(PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.create_realtime);

	//
	// B. Render components

	if (!hasPermissionCreate) {
		return <NoDataLabel text="Selecione um alerta" />;
	}

	return (
		<Pane header={[
			<RealtimeCreateHeader />,
			realtimeCreateContext.data.multi_step.current === 'trip' && <RealtimeCreateStepRidesFilters />,
			realtimeCreateContext.data.multi_step.current === 'trip' && <RealtimeCreateStepRidesSelectionControls />,
		]}
		>
			{realtimeCreateContext.data.multi_step.current === 'cause' && <RealtimeCreateStepCause />}
			{realtimeCreateContext.data.multi_step.current === 'effect' && <RealtimeCreateStepEffect />}
			{realtimeCreateContext.data.multi_step.current === 'trip' && <RealtimeCreateStepRidesSelection />}
			{realtimeCreateContext.data.multi_step.current === 'summary' && <RealtimeCreateStepSummary />}
		</Pane>
	);

	//
}
