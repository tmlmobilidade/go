'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, CreateButton, HasPermission, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeCreateZoneModal } from '../ZoneCreate.modal';
import { useZonesCreateFormContext } from '../ZonesCreateForm.context';

/* * */

export function ZoneCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, form, status } = useZonesCreateFormContext();
	const title = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateZoneModal} type="close" />
			<Tag label={t('default:zones.create.title')} variant="muted" />
			<Label size="lg" singleLine>{title}</Label>
			<Spacer />
			<HasPermission action={PermissionCatalog.all.zones.actions.create} scope={PermissionCatalog.all.zones.scope}>
				<CreateButton isDisabled={!capabilities.createEnabled} isLoading={status.isCreating} onClick={actions.create} />
			</HasPermission>
		</Toolbar>
	);

	//
}
