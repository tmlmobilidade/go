'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { HasPermission, PublishStatusDisplay, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';

import { useSchoolsCreateFormContext } from '../SchoolsCreateForm.context';

/* * */

export function SchoolCreateFooter() {
	//

	//
	// A. Setup variables

	const { form } = useSchoolsCreateFormContext();

	const agencyIdValue = useStandardFormWatch({ control: form.control, name: 'agency_id' });
	const publishStatusValue = useStandardFormWatch({ control: form.control, name: 'publish_status' });

	//
	// B. Render components

	return (
		<Toolbar>
			<HasPermission
				action={PermissionCatalog.all.schools.actions.update_publish_status}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.schools.scope}
				value={agencyIdValue}
			>
				<PublishStatusDisplay
					onChange={value => form.setValue('publish_status', value, { shouldDirty: true })}
					value={publishStatusValue}
				/>
			</HasPermission>

		</Toolbar>
	);
}
