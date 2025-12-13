'use client';

/* * */
import { useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams, Label } from '@tmlmobilidade/ui';
import { CloseButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function OrganizationDetailHeader() {
	//

	//
	// A. Setup variables

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
			<CloseButton onClick={handleClose} type="close" />
			<Tag label={organizationDetailContext.data.id || 'Nova Organização'} variant="muted" />
			<Label size="lg" singleLine>{organizationDetailContext.data.form.values.long_name}</Label>
			<Spacer />
			<Button
				disabled={!organizationDetailContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={organizationDetailContext.flags.isSaving}
				onClick={organizationDetailContext.actions.updateOrganization}
				variant="primary"
			/>
			<Button
				icon={<IconTrash size={28} />}
				label="Apagar"
				onClick={organizationDetailContext.actions.deleteOrganization}
				variant="danger"
			/>
		</Toolbar>
	);

	//
}
