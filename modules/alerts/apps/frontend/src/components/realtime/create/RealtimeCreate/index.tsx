'use client';

/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { RealtimeCreateHeader } from '@/components/realtime/create/RealtimeCreateHeader';
import { RealtimeCreateStepCause } from '@/components/realtime/create/RealtimeCreateStepCause';
import { RealtimeCreateStepEffect } from '@/components/realtime/create/RealtimeCreateStepEffect';
import { RealtimeCreateStepRides } from '@/components/realtime/create/RealtimeCreateStepRides';
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

	const hasPermissionCreate = meContext.actions.hasPermission(PermissionCatalog.all.alerts_realtime.scope, PermissionCatalog.all.alerts_realtime.actions.create);

	//
	// B. Render components

	if (!hasPermissionCreate) {
		return <NoDataLabel text="Selecione um alerta" />;
	}

	return (
		<Pane header={[<RealtimeCreateHeader />]}>
			{realtimeCreateContext.data.currentStep.id === 'cause' && <RealtimeCreateStepCause />}
			{realtimeCreateContext.data.currentStep.id === 'effect' && <RealtimeCreateStepEffect />}
			{realtimeCreateContext.data.currentStep.id === 'trip' && <RealtimeCreateStepRides />}
			{realtimeCreateContext.data.currentStep.id === 'summary' && <RealtimeCreateStepSummary />}
		</Pane>
	);
}
