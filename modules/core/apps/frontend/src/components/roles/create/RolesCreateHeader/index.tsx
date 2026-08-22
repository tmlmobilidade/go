'use client';

import { closeRolesCreateModal } from '@/components/roles/create/RolesCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Role } from '@tmlmobilidade/go-types-core';
import { Button, CloseButton, fetchApiData, keepUrlParams, Label, Spacer, Tag, Toolbar, useStandardFormWatch, useHandleUpdate } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRolesListData } from '../../list/use-roles-list-data';
import { useRolesCreateFormContext } from '../RolesCreateForm.context';

/* * */

export function RolesCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { mutate } = useRolesListData();

	const { form, unblock } = useRolesCreateFormContext();

	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Handle actions

	const { action, isLoading } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Role>({ body: form.getValues(), method: 'POST', url: API_ROUTES.core.ROLES_CREATE }),
		onSuccess: ({ data }) => {
			form.reset();
			unblock();
			mutate();
			if (data?._id) {
				const newUrl = keepUrlParams(PAGE_ROUTES.core.ROLES_DETAIL(data._id));
				window.location.href = newUrl;
			};
		},
	});

	//
	// C. Render components

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
				loading={isLoading}
				onClick={action}
				variant="primary"
			/>
		</Toolbar>
	);
}
