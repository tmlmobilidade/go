'use client';

/* * */

import { HomeLink } from '@tmlmobilidade/types';
import { Button, Section } from '@tmlmobilidade/ui';

/* * */

export function OrganizationDetailQuickLinksActions({ handleDelete, handleEdit, link }: { handleDelete: (link: HomeLink) => void, handleEdit: (link: HomeLink) => void, link: HomeLink }) {
	return (
		<Section flexDirection="row" gap="sm" padding="none">
			<Button label="Delete" onClick={() => handleDelete(link)}>Delete</Button>
			<Button label="Edit" onClick={() => handleEdit(link)}>Edit</Button>
		</Section>
	);
}
