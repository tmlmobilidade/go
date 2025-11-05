'use client';

import { OrganizationsDetailMode, useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
/* * */

import { keepUrlParams } from '@tmlmobilidade/utils';
import { IconTrash, IconUpload } from '@tabler/icons-react';
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
		const destUrl = keepUrlParams('/users', window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={organizationDetailContext.data.id || 'Nova Organização'} variant="muted" />
			<Spacer />
			<Button
				disabled={!organizationDetailContext.flags.canSave}
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
