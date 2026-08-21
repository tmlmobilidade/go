'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, PublishStatusDisplay, Spacer, Toolbar, useContextFormWatch } from '@tmlmobilidade/ui';

import { useAlertsCreateFormContext } from '../AlertsCreateForm.context';
import { useAlertsCreateFormStepsContext } from '../AlertsCreateFormSteps.context';
import { useAlertsCreatePublish } from '../use-alerts-create-publish';

/* * */

export function AlertCreateFooter() {
	//

	//
	// A. Setup variables

	const { form: alertsCreateForm } = useAlertsCreateFormContext();
	const { actions: alertsCreateFormStepsActions, progress: alertsCreateFormStepsProgress } = useAlertsCreateFormStepsContext();
	const { isLoading: isCreating, publish } = useAlertsCreatePublish();

	const agencyIdValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'agency_id' });
	const publishStatusValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'publish_status' });

	//
	// B. Render components

	return (
		<Toolbar>

			<HasPermission
				action={PermissionCatalog.all.alerts.actions.update_publish_status}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.alerts.scope}
				value={agencyIdValue}
			>
				<PublishStatusDisplay
					onChange={value => alertsCreateForm.setValue('publish_status', value, { shouldDirty: true })}
					value={publishStatusValue}
				/>
			</HasPermission>

			<Spacer />

			<Button
				disabled={!alertsCreateFormStepsProgress.prev?.id}
				label="Voltar"
				onClick={alertsCreateFormStepsActions.prev}
				variant="secondary"
			/>

			{alertsCreateFormStepsProgress.next?.id && (
				<Button
					disabled={!alertsCreateFormStepsProgress.current?.isValid}
					label="Avançar"
					onClick={alertsCreateFormStepsActions.next}
				/>
			)}

			{!alertsCreateFormStepsProgress.next?.id && (
				<Button
					disabled={!alertsCreateFormStepsProgress.current?.isValid}
					label="Publicar"
					loading={isCreating}
					onClick={publish}
				/>
			)}
		</Toolbar>
	);
}
