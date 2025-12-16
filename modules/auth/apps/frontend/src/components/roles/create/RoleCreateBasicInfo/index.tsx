'use client';

import { useRoleCreateContext } from '@/contexts/RoleCreate.context';
/* * */

import { Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RoleCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const roleCreateContext = useRoleCreateContext();
	const { t } = useTranslation('auth', { keyPrefix: 'roles.create.basicInfo' });

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="ab" gap="xl">
				<TextInput
					key={roleCreateContext.data.form.key('name')}
					label={t('fields.name')}
					maxLength={255}
					placeholder={t('fields.placeholder')}
					withAsterisk
					{...roleCreateContext.data.form.getInputProps('name')}
				/>
			</Grid>
		</Section>
	);

	//
}
