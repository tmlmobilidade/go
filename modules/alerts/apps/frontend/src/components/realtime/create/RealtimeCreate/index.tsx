'use client';

/* * */

import { RealtimeCreateHeader } from '@/components/realtime/create/RealtimeCreateHeader';
import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { ErrorDisplay, Pane, useMeContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RealtimeCreate() {
	//
	// A. Setup variables

	const context = useRealtimeCreateContext();
	const meContext = useMeContext();

	const hasPermissionToCreate = meContext.actions.hasPermission(PermissionCatalog.all.alerts_realtime.scope, PermissionCatalog.all.alerts_realtime.actions.create);
	const { t } = useTranslation('alerts', { keyPrefix: 'realtime.create' });

	//
	// C. Render components

	if (!hasPermissionToCreate) {
		return <ErrorDisplay message={t('no_permission')} />;
	}

	return (
		<Pane header={[<RealtimeCreateHeader />]}>
			<context.data.currentStep.component />
		</Pane>
	);
}
