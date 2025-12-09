'use client';

/* * */

import { useOrganizationCreateContext } from '@/contexts/OrganizationCreate.context';
import { IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

interface OrganizationCreateHeaderProps {
	onClose?: () => void
}

export function OrganizationCreateHeader({ onClose }: OrganizationCreateHeaderProps) {
	//

	//
	// A. Setup variables

	const organizationCreateContext = useOrganizationCreateContext();

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={onClose} type="close" />
			<Tag label="Nova Organização" variant="muted" />
			<Label size="lg" singleLine>{organizationCreateContext.data.form.values.long_name}</Label>
			<Spacer />
			<Button
				disabled={!organizationCreateContext.data.form.values.short_name}
				icon={<IconUpload size={28} />}
				label="Publicar"
				loading={organizationCreateContext.flags.isSaving}
				onClick={organizationCreateContext.actions.saveOrganization}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
