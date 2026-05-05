'use client';

/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, HasPermission, PublishStatusTag, Spacer, Toolbar, useContextFormWatch } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateFooter() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	const publishStatusValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'publish_status' });

	//
	// B. Render components

	return (
		<Toolbar>

			<HasPermission
				action={PermissionCatalog.all.alerts.actions.update_publish_status}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.alerts.scope}
				value={alertCreateContext.form.instance.getValues('agency_id')}
			>
				<PublishStatusTag
					onChange={value => alertCreateContext.form.instance.setValue('publish_status', value, { shouldDirty: true })}
					value={publishStatusValue}
				/>
			</HasPermission>

			<Spacer />

			<Button
				disabled={alertCreateContext.form.multi_step.progress.current?.id === 'cause'}
				label="Voltar"
				onClick={alertCreateContext.form.multi_step.actions.prev}
				variant="secondary"
			/>

			{alertCreateContext.form.multi_step.progress.current?.id !== 'summary' && (
				<Button
					disabled={!alertCreateContext.form.multi_step.progress.current?.isValid()}
					label="Avançar"
					onClick={alertCreateContext.form.multi_step.actions.next}
				/>
			)}

			{alertCreateContext.form.multi_step.progress.current?.id === 'summary' && (
				<Button
					disabled={!alertCreateContext.form.multi_step.progress.current?.isValid()}
					label="Publicar"
					loading={alertCreateContext.flags.isCreating}
					onClick={alertCreateContext.actions.create}
				/>
			)}

		</Toolbar>
	);

	//
}
