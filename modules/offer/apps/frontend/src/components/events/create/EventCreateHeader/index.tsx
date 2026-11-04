'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, CreateButton, HasPermission, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeCreateEventModal } from '../EventCreate.modal';
import { useEventsCreateFormContext } from '../EventsCreateForm.context';

/* * */

export function EventCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, form, status } = useEventsCreateFormContext();
	const title = useStandardFormWatch({ control: form.control, name: 'title' });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateEventModal} type="close" />
			<Tag label={t('default:events.create.title')} variant="muted" />
			<Label size="lg" singleLine>{title}</Label>
			<Spacer />
			<HasPermission action={PermissionCatalog.all.events.actions.create} scope={PermissionCatalog.all.events.scope}>
				<CreateButton isDisabled={!capabilities.createEnabled} isLoading={status.isCreating} onClick={actions.create} />
			</HasPermission>
		</Toolbar>
	);

	//
}
