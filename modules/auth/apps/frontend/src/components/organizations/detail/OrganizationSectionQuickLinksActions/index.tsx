'use client';

/* * */

import { HomeLink } from '@tmlmobilidade/types';
import { Button, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function OrganizationDetailQuickLinksActions({ handleDelete, handleEdit, link }: { handleDelete: (link: HomeLink) => void, handleEdit: (link: HomeLink) => void, link: HomeLink }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('operations');

	//
	// B. Render Components

	return (
		<Section flexDirection="row" gap="sm" padding="none">
			<Button label={t('delete')} onClick={() => handleDelete(link)}>{t('delete')}</Button>
			<Button label={t('edit')} onClick={() => handleEdit(link)}>{t('edit')}</Button>
		</Section>
	);

	//
}
