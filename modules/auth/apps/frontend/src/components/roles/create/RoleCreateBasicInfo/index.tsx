'use client';

import { useRoleCreateContext } from '@/components/roles/create/RoleCreate.context';
import { Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RoleCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const roleCreateContext = useRoleCreateContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="a" gap="xl">
				<TextInput
					key={roleCreateContext.data.form.key('name')}
					label={t('default:roles.create.BasicInfo.fields.name.label')}
					maxLength={255}
					placeholder={t('default:roles.create.BasicInfo.fields.name.placeholder')}
					data-autofocus
					withAsterisk
					{...roleCreateContext.data.form.getInputProps('name')}
				/>
			</Grid>
		</Section>
	);

	//
}
