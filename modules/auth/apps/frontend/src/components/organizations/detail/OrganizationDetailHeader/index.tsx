'use client';

import { OrganizationsDetailMode, useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
/* * */

import { IconTrash, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams, Label } from '@tmlmobilidade/ui';
import { BackButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
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
			<BackButton onClick={handleClose} type="close" />
			<Tag label={organizationDetailContext.data.id || 'Nova Organização'} variant="muted" />
			<Label size="lg" singleLine>{organizationDetailContext.data.form.values.long_name}</Label>
			<Spacer />
			<Button
				disabled={!organizationDetailContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label={organizationDetailContext.flags.mode === OrganizationsDetailMode.CREATE ? 'Publicar' : 'Guardar'}
				loading={organizationDetailContext.flags.isSaving}
				onClick={organizationDetailContext.actions.saveOrganization}
				variant="primary"
			/>
			{organizationDetailContext.flags.mode === OrganizationsDetailMode.EDIT && (
				<Button
					icon={<IconTrash size={28} />}
					label="Apagar"
					onClick={organizationDetailContext.actions.deleteOrganization}
					variant="danger"
				/>
			)}
		</Toolbar>
	);

	//
}
