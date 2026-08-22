'use client';

import { closeOrganizationsCreateModal } from '@/components/organizations/create/OrganizationsCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Organization } from '@tmlmobilidade/go-types-core';
import { Button, CloseButton, fetchApiData, keepUrlParams, Label, Spacer, Tag, Toolbar, useContextFormWatch, useHandleUpdate } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useOrganizationsListData } from '../../list/use-organizations-list-data';
import { useOrganizationsCreateFormContext } from '../OrganizationsCreateForm.context';

/* * */

export function OrganizationsCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { mutate } = useOrganizationsListData();

	const { form, unblock } = useOrganizationsCreateFormContext();

	const longNameValue = useContextFormWatch({ control: form.control, name: 'long_name' });

	//
	// B. Handle actions

	const { action, isLoading } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Organization>({ body: form.getValues(), method: 'POST', url: API_ROUTES.core.ORGANIZATIONS_CREATE }),
		onSuccess: ({ data }) => {
			form.reset();
			unblock();
			mutate();
			if (data?._id) {
				const newUrl = keepUrlParams(PAGE_ROUTES.core.ORGANIZATIONS_DETAIL(data._id));
				window.location.href = newUrl;
			};
		},
	});

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeOrganizationsCreateModal} type="close" />
			<Tag label={t('default:organizations.create.Header.PublishButton.label')} variant="secondary" />
			<Label size="lg" singleLine>{longNameValue}</Label>
			<Spacer />
			<Button
				disabled={!longNameValue}
				icon={<IconUpload size={28} />}
				label={t('default:organizations.create.Header.PublishButton.label')}
				loading={isLoading}
				onClick={action}
				variant="primary"
			/>
		</Toolbar>
	);
}
