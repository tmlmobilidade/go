'use client';

/* * */
import { useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams, Label } from '@tmlmobilidade/ui';
import { BackButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function OrganizationDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('auth', { keyPrefix: 'organizations.detail.header' });

	const router = useRouter();
	const organizationDetailContext = useOrganizationsDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams(PAGE_ROUTES.auth.ORGANIZATIONS_LIST, window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={organizationDetailContext.data.id || t('new_organization_button_label')} variant="muted" />
			<Label size="lg" singleLine>{organizationDetailContext.data.form.values.long_name}</Label>
			<Spacer />
			<Button
				disabled={!organizationDetailContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label={t('save_button_label')}
				loading={organizationDetailContext.flags.isSaving}
				onClick={organizationDetailContext.actions.updateOrganization}
				variant="primary"
			/>
			<Button
				icon={<IconTrash size={28} />}
				label={t('delete_button_label')}
				onClick={organizationDetailContext.actions.deleteOrganization}
				variant="danger"
			/>
		</Toolbar>
	);

	//
}
