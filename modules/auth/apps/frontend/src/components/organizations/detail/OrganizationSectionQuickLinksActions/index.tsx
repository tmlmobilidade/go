'use client';

import { HomeLink } from '@tmlmobilidade/types';
import { Button, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function OrganizationDetailQuickLinksActions({ handleDelete, handleEdit, link }: { handleDelete: (link: HomeLink) => void, handleEdit: (link: HomeLink) => void, link: HomeLink }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render Components

	return (
		<Section flexDirection="row" gap="sm" padding="none">
			<Button label={t('default:organizations.detail.SectionBasicInfo.fields.short_name.placeholder')} onClick={() => handleDelete(link)}>{t('default:organizations.detail.SectionBasicInfo.fields.short_name.placeholder')}</Button>
			<Button label={t('default:organizations.detail.SectionBasicInfo.fields.short_name.placeholder')} onClick={() => handleEdit(link)}>{t('default:organizations.detail.SectionBasicInfo.fields.short_name.placeholder')}</Button>
		</Section>
	);

	//
}
