'use client';

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { AlertCreateFooter } from '@/components/create/AlertCreateFooter';
import { AlertCreateHeader } from '@/components/create/AlertCreateHeader';
import { AlertCreateStepAgency } from '@/components/create/AlertCreateStepAgency';
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

	const hasPermissionCreate = meContext.actions.hasPermission(PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.create);

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
		<Pane footer={[<AlertCreateFooter key="footer" />]} header={[<AlertCreateHeader key="header" />]}>
			{alertCreateContext.form.multi_step.progress.current?.id === 'agency' && <AlertCreateStepAgency />}
			{alertCreateContext.form.multi_step.progress.current?.id === 'cause' && <AlertCreateStepCause />}
			{alertCreateContext.form.multi_step.progress.current?.id === 'effect' && <AlertCreateStepEffect />}
			{alertCreateContext.form.multi_step.progress.current?.id === 'dates' && <AlertCreateStepDates />}
			{alertCreateContext.form.multi_step.progress.current?.id === 'references' && <AlertCreateStepReferences />}
			{alertCreateContext.form.multi_step.progress.current?.id === 'summary' && <AlertCreateStepSummary />}
		</Pane>
	);
}
