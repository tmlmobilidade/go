'use client';

/* * */

import { useRoleDetailContext } from '@/components/roles/detail/RoleDetail.context';
import { Collapsible, Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RoleDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const roleDetailContext = useRoleDetailContext();
	const { t } = useTranslation('auth');

	//
	// B. Render components

	return (
		<Collapsible
			description={t('roles.detail.BasicInfo.description')}
			title={t('roles.detail.BasicInfo.title')}
		>
			<Section gap="md">
				<Grid columns="ab" gap="xl">
					<TextInput
						key={roleDetailContext.data.form.key('name')}
						label={t('roles.detail.BasicInfo.fields.name.label')}
						maxLength={255}
						placeholder={t('roles.detail.BasicInfo.fields.name.placeholder')}
						readOnly={roleDetailContext.flags.isReadOnly}
						withAsterisk
						{...roleDetailContext.data.form.getInputProps('name')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
