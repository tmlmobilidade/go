'use client';

/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { RealtimeCreateHeader } from '@/components/realtime/create/RealtimeCreateHeader';
import { RealtimeCreateStepCause } from '@/components/realtime/create/RealtimeCreateStepCause';
import { RealtimeCreateStepEffect } from '@/components/realtime/create/RealtimeCreateStepEffect';
import { RealtimeCreateStepSummary } from '@/components/realtime/create/RealtimeCreateStepSummary';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { NoDataLabel, Pane, useMeContext } from '@tmlmobilidade/ui';

import { RealtimeCreateStepRidesFilters } from '../RealtimeCreateStepRidesFilters';
import { RealtimeCreateStepRidesSelection } from '../RealtimeCreateStepRidesSelection';
import { RealtimeCreateStepRidesSelectionControls } from '../RealtimeCreateStepRidesSelectionControls';

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
			realtimeCreateContext.data.currentStep.id === 'trip' && <RealtimeCreateStepRidesFilters />,
			realtimeCreateContext.data.currentStep.id === 'trip' && <RealtimeCreateStepRidesSelectionControls />,
		]}
		>
			{realtimeCreateContext.data.currentStep.id === 'cause' && <RealtimeCreateStepCause />}
			{realtimeCreateContext.data.currentStep.id === 'effect' && <RealtimeCreateStepEffect />}
			{realtimeCreateContext.data.currentStep.id === 'trip' && <RealtimeCreateStepRidesSelection />}
			{realtimeCreateContext.data.currentStep.id === 'summary' && <RealtimeCreateStepSummary />}
		</Pane>
	);

	//
}
