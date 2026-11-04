'use client';

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { useLineCreateContext } from '@/components/lines/create/LineCreate.context';
import { LineSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function LineCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const lineCreateContext = useLineCreateContext();

	// Get agencies with create permission
	const { options: agencyOptions } = useAgenciesData({ permissions: { actions: [PermissionCatalog.all.lines.actions.create], scope: PermissionCatalog.all.lines.scope } });

	//
	// B. Render components

	return (
		<Section gap="md">

			<StandardFormController
				control={lineCreateContext.form.control}
				name="name"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label={t('lines:create.LineCreateBasicInfo.name')}
						placeholder={t('lines:create.LineCreateBasicInfo.line_example')}
						readOnly={!lineCreateContext.capabilities.editEnabled}
						required={!LineSchema.shape.name.isOptional()}
						w="100%"
						{...field}
						value={field.value ?? ''}
					/>
				)}
			/>

			<StandardFormController
				control={lineCreateContext.form.control}
				name="code"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label={t('lines:create.LineCreateBasicInfo.code')}
						placeholder={t('lines:create.LineCreateBasicInfo.code_example')}
						readOnly={!lineCreateContext.capabilities.editEnabled}
						required={!LineSchema.shape.code.isOptional()}
						w="100%"
						{...field}
						value={field.value ?? ''}
					/>
				)}
			/>

			<StandardFormController
				control={lineCreateContext.form.control}
				name="agency_id"
				render={({ field, fieldState }) => (
					<Select
						data={agencyOptions}
						error={fieldState.error?.message}
						label={t('lines:create.LineCreateBasicInfo.agency')}
						readOnly={!lineCreateContext.capabilities.editEnabled}
						required={!LineSchema.shape.agency_id.isOptional()}
						w="100%"
						{...field}
						value={field.value ?? null}
					/>
				)}
			/>

		</Section>
	);

	//
}
