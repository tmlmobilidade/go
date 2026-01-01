'use client';

/* * */

import { useRealtimeCreateContext } from '@/components/create/RealtimeCreate.context';
import { RealtimeCreateHeader } from '@/components/create/RealtimeCreateHeader';
import { RealtimeCreateStepCause } from '@/components/create/RealtimeCreateStepCause';
import { RealtimeCreateStepEffect } from '@/components/create/RealtimeCreateStepEffect';
import { RealtimeCreateStepRidesFilters } from '@/components/create/RealtimeCreateStepRidesFilters';
import { RealtimeCreateStepRidesSelection } from '@/components/create/RealtimeCreateStepRidesSelection';
import { RealtimeCreateStepRidesSelectionControls } from '@/components/create/RealtimeCreateStepRidesSelectionControls';
import { RealtimeCreateStepSummary } from '@/components/create/RealtimeCreateStepSummary';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { NoDataLabel, Pane, useMeContext } from '@tmlmobilidade/ui';

/* * */

export function RealtimeCreate() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const realtimeCreateContext = useRealtimeCreateContext();

	const hasPermissionCreate = meContext.actions.hasPermissionResource({
		action: PermissionCatalog.all.alerts.actions.create,
		resource_key: 'reference_types',
		scope: PermissionCatalog.all.alerts.scope,
		value: 'rides',
	});

	//
	// B. Render components

	if (!hasPermissionCreate) {
		return <NoDataLabel text="Selecione um alerta" />;
	}

	return (
		<Pane header={[
			<RealtimeCreateHeader />,
			realtimeCreateContext.data.multi_step.current === 'references' && <RealtimeCreateStepRidesFilters />,
			realtimeCreateContext.data.multi_step.current === 'references' && <RealtimeCreateStepRidesSelectionControls />,
		]}
		>
			{realtimeCreateContext.data.multi_step.current === 'cause' && <RealtimeCreateStepCause />}
			{realtimeCreateContext.data.multi_step.current === 'effect' && <RealtimeCreateStepEffect />}
			{realtimeCreateContext.data.multi_step.current === 'references' && <RealtimeCreateStepRidesSelection />}
			{realtimeCreateContext.data.multi_step.current === 'summary' && <RealtimeCreateStepSummary />}
		</Pane>
	);

	//
}
