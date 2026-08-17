'use client';

import { useAlertsCreateFormStepsContext } from '@/components/create/shared/AlertsCreateFormSteps.context';
import { AlertCreateStepAgency } from '@/components/create/steps/AlertCreateStepAgency';
import { AlertCreateStepCause } from '@/components/create/steps/AlertCreateStepCause';
import { AlertCreateStepDates } from '@/components/create/steps/AlertCreateStepDates';
import { AlertCreateStepEffect } from '@/components/create/steps/AlertCreateStepEffect';
import { AlertCreateStepReferences } from '@/components/create/steps/AlertCreateStepReferences';
import { AlertCreateStepSummary } from '@/components/create/steps/AlertCreateStepSummary';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { NoDataLabel, Surface, useMeContext } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateSteps() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const alertsCreateFormStepsContext = useAlertsCreateFormStepsContext();

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
		<>
			{alertsCreateFormStepsContext.progress.current?.id === 'agency' && <AlertCreateStepAgency />}
			{alertsCreateFormStepsContext.progress.current?.id === 'cause' && <AlertCreateStepCause />}
			{alertsCreateFormStepsContext.progress.current?.id === 'effect' && <AlertCreateStepEffect />}
			{alertsCreateFormStepsContext.progress.current?.id === 'dates' && <AlertCreateStepDates />}
			{alertsCreateFormStepsContext.progress.current?.id === 'references' && <AlertCreateStepReferences />}
			{alertsCreateFormStepsContext.progress.current?.id === 'summary' && <AlertCreateStepSummary />}
		</>
	);
}
