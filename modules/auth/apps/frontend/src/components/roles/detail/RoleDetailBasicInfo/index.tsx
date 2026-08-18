'use client';

import { useRoleDetailContext } from '@/components/roles/detail/RoleDetail.context';
import { Collapsible, ContextFormController, Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RoleDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const roleDetailContext = useRoleDetailContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:roles.detail.BasicInfo.description')}
			title={t('default:roles.detail.BasicInfo.title')}
		>
			<Section gap="md">
				<Grid columns="ab" gap="xl">
					<ContextFormController
						control={roleDetailContext.form.instance.control}
						name="name"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('default:roles.detail.BasicInfo.fields.name.label')}
								maxLength={255}
								onBlur={field.onBlur}
								onChange={field.onChange}
								placeholder={t('default:roles.detail.BasicInfo.fields.name.placeholder')}
								readOnly={roleDetailContext.flags.isReadOnly}
								value={field.value ?? ''}
								withAsterisk
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
