'use client';

import { closeRolesCreateModal } from '@/components/roles/create/RolesCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRolesCreateFormContext } from '../RolesCreateForm.context';

/* * */

export function RolesCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions, form, status } = useRolesCreateFormContext();

	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeRolesCreateModal} type="close" />
			<Tag label={t('default:roles.create.Header.NewRoleButton.label')} variant="secondary" />
			<Label size="lg" singleLine>{nameValue}</Label>
			<Spacer />
			<Button
				disabled={!nameValue}
				icon={<IconUpload size={28} />}
				label={t('default:roles.create.Header.UpdateButton.label')}
				loading={status.isCreating}
				onClick={actions.create}
				variant="primary"
			/>
		</Toolbar>
	);
}
