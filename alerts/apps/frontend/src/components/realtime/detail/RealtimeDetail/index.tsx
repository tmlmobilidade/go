'use client';

/* * */

import { RealtimeDetailHeader } from '@/components/realtime/detail/RealtimeDetailHeader';
import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { Permissions } from '@tmlmobilidade/lib';
import { ErrorDisplay, Pane, useMeContext } from '@tmlmobilidade/ui';

/* * */

export function RealtimeDetail() {
	//
	// A. Setup variables

	const context = useRealtimeDetailContext();
	const meContext = useMeContext();

	const hasPermissionToCreate = meContext.actions.hasPermission(Permissions.alerts_realtime.scope, Permissions.alerts_realtime.actions.create);

	//
	// C. Render components

	if (!hasPermissionToCreate) {
		return <ErrorDisplay message="Não tem permissão para criar alertas" />;
	}

	return (
		<Pane header={[<RealtimeDetailHeader />]}>
			<context.data.currentStep.component />
		</Pane>
	);
}
