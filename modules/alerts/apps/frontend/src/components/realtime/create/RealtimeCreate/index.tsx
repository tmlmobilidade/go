'use client';

/* * */

import { RealtimeCreateHeader } from '@/components/realtime/create/RealtimeCreateHeader';
import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { Permissions } from '@tmlmobilidade/lib';
import { ErrorDisplay, Pane, useMeContext } from '@tmlmobilidade/ui';

/* * */

export function RealtimeCreate() {
	//
	// A. Setup variables

	const context = useRealtimeCreateContext();
	const meContext = useMeContext();

	const hasPermissionToCreate = meContext.actions.hasPermission(Permissions.alerts_realtime.scope, Permissions.alerts_realtime.actions.create);

	//
	// C. Render components

	if (!hasPermissionToCreate) {
		return <ErrorDisplay message="Não tem permissão para criar alertas" />;
	}

	return (
		<Pane header={[<RealtimeCreateHeader />]}>
			<context.data.currentStep.component />
		</Pane>
	);
}
