'use client';

import { AlertCreateFooter } from '@/components/create/AlertCreateFooter';
import { AlertCreateHeader } from '@/components/create/AlertCreateHeader';
import { AlertCreateSteps } from '@/components/create/steps/AlertCreateSteps';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { NoDataLabel, Pane, Surface, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { AlertsCreateFormContextProvider } from '../AlertsCreateForm.context';
import { AlertsCreateFormStepsContextProvider } from '../AlertsCreateFormSteps.context';

/* * */

export function AlertCreate() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const hasPermissionCreate = useMemo(() => {
		return meContext?.actions.hasPermission(PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.create);
	}, [meContext]);

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
		<AlertsCreateFormContextProvider>
			<AlertsCreateFormStepsContextProvider>
				<Pane
					footer={[<AlertCreateFooter key="footer" />]}
					header={[<AlertCreateHeader key="header" />]}
				>
					<AlertCreateSteps />
				</Pane>
			</AlertsCreateFormStepsContextProvider>
		</AlertsCreateFormContextProvider>
	);
}
