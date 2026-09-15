'use client';

import { iconData } from '@/lib/icons';
import { Combobox } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface OrganizationsDetailQuickLinksIconChooserProps {
	onChange: (icon: string) => void
	value?: string
}

/* * */

export function OrganizationsDetailQuickLinksIconChooser({ onChange, value }: OrganizationsDetailQuickLinksIconChooserProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Combobox
			data={iconData}
			label={t('default:common.IconChooser.label')}
			onChange={onChange}
			value={iconData.find(item => item.value === value)?.value}
			clearable
			fullWidth
		/>
	);

	//
}
