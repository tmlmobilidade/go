'use client';

/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { RealtimeCreateHeader } from '@/components/realtime/create/RealtimeCreateHeader';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { ErrorDisplay, Pane, useMeContext } from '@tmlmobilidade/ui';

/* * */

export function RealtimeCreate() {
	//
	// A. Setup variables

	const context = useRealtimeCreateContext();
	const meContext = useMeContext();

	const hasPermissionToCreate = meContext.actions.hasPermission(PermissionCatalog.all.alerts_realtime.scope, PermissionCatalog.all.alerts_realtime.actions.create);

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
