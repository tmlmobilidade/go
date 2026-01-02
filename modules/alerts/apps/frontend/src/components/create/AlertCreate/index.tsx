'use client';

/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { AlertCreateFooter } from '@/components/create/AlertCreateFooter';
import { AlertCreateHeader } from '@/components/create/AlertCreateHeader';
import { AlertCreateStepCause } from '@/components/create/AlertCreateStepCause';
import { AlertCreateStepDates } from '@/components/create/AlertCreateStepDates';
import { AlertCreateStepEffect } from '@/components/create/AlertCreateStepEffect';
import { AlertCreateStepReferences } from '@/components/create/AlertCreateStepReferences';
import { AlertCreateStepSummary } from '@/components/create/AlertCreateStepSummary';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { NoDataLabel, Pane, Surface, useMeContext } from '@tmlmobilidade/ui';

/* * */

export function AlertCreate() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const alertCreateContext = useAlertCreateContext();

	const hasPermissionCreate = meContext.actions.hasPermissionResource({
		action: PermissionCatalog.all.alerts.actions.create,
		resource_key: 'reference_types',
		scope: PermissionCatalog.all.alerts.scope,
		value: 'rides',
	});

	//
	// B. Render components

	if (!hasPermissionCreate) {
		return (
			<Surface align="center" justify="center" variant="transparent">
				<NoDataLabel text="Selecione um alerta" />
			</Surface>
		);
	}

	return (
		<Pane footer={[<AlertCreateFooter />]} header={[<AlertCreateHeader />]}>
			{alertCreateContext.data.multi_step.current === 'cause' && <AlertCreateStepCause />}
			{alertCreateContext.data.multi_step.current === 'effect' && <AlertCreateStepEffect />}
			{alertCreateContext.data.multi_step.current === 'dates' && <AlertCreateStepDates />}
			{alertCreateContext.data.multi_step.current === 'references' && <AlertCreateStepReferences />}
			{alertCreateContext.data.multi_step.current === 'summary' && <AlertCreateStepSummary />}
		</Pane>
	);

	//
}
