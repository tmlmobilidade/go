'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, PublishStatusDisplay, Spacer, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';

import { useSchoolCreateFormContext } from '../SchoolCreateForm.context';
import { useSchoolCreatePublish } from '../use-schools-create-publish';

/* * */

export function SchoolCreateFooter() {
	//

	//
	// A. Setup variables

	const { form: schoolCreateForm } = useSchoolCreateFormContext();
	const { isLoading: isCreating, publish } = useSchoolCreatePublish();

	const publishStatusValue = useStandardFormWatch({ control: schoolCreateForm.control, name: 'publish_status' });
	const agencyIdValue = useStandardFormWatch({ control: schoolCreateForm.control, name: 'agency_id' });

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
					onChange={value => schoolCreateForm.setValue('publish_status', value, { shouldDirty: true })}
					value={publishStatusValue}
				/>
			</HasPermission>

			<Spacer />

			<Button
				label="Publicar"
				loading={isCreating}
				onClick={publish}
			/>
		</Toolbar>
	);
}
