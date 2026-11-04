'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, CreateButton, HasPermission, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useTypologiesCreateFormContext } from '../TypologiesCreateForm.context';
import { closeCreateTypologyModal } from '../TypologyCreate.modal';

/* * */

export function TypologyCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, form, status } = useTypologiesCreateFormContext();
	const title = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateTypologyModal} type="close" />
			<Tag label={t('default:typologies.create.title')} variant="muted" />
			<Label size="lg" singleLine>{title}</Label>
			<Spacer />
			<HasPermission action={PermissionCatalog.all.typologies.actions.create} scope={PermissionCatalog.all.typologies.scope}>
				<CreateButton isDisabled={!capabilities.createEnabled} isLoading={status.isCreating} onClick={actions.create} />
			</HasPermission>
		</Toolbar>
	);

	//
}
