'use client';

/* * */

import { useRoleDetailContext } from '@/contexts/RoleDetail.context';
import { Collapsible, Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RoleDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const roleDetailContext = useRoleDetailContext();
	const { t } = useTranslation('auth', { keyPrefix: 'roles.detail.BasicInfo' });

	//
	// B. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section gap="md">
				<Grid columns="ab" gap="xl">
					<TextInput
						key={roleDetailContext.data.form.key('name')}
						label={t('fields.name')}
						maxLength={255}
						placeholder="..."
						withAsterisk
						{...roleDetailContext.data.form.getInputProps('name')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
