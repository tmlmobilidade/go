'use client';

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { useLineCreateContext } from '@/components/lines/create/LineCreate.context';
import { useTypologiesContext } from '@/contexts/Typologies.context';
import { LineSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Section, Select, StandardFormController, TextInput, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function LineCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const lineCreateContext = useLineCreateContext();
	const values = useStandardFormWatch({ control: lineCreateContext.form.control });
	const typologiesContext = useTypologiesContext();

	// Get agencies with create permission
	const { options: agencyOptions } = useAgenciesData({ permissions: { actions: [PermissionCatalog.all.lines.actions.create], scope: PermissionCatalog.all.lines.scope } });
	const typologyOptions = useMemo(() => typologiesContext.data.raw
		.filter(typology => !!values.agency_id && typology.agency_ids.includes(values.agency_id))
		.map(typology => ({ label: typology.name, value: typology._id })), [typologiesContext.data.raw, values.agency_id]);

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
						w="100%"
						withAsterisk={!LineSchema.shape.name.isOptional()}
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
						w="100%"
						withAsterisk={!LineSchema.shape.code.isOptional()}
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
						w="100%"
						withAsterisk={!LineSchema.shape.agency_id.isOptional()}
						{...field}
						value={field.value ?? null}
						onChange={(agencyId) => {
							field.onChange(agencyId);
							lineCreateContext.form.setValue('typology', '', { shouldDirty: true, shouldValidate: true });
						}}
					/>
				)}
			/>

			<StandardFormController
				control={lineCreateContext.form.control}
				name="typology"
				render={({ field, fieldState }) => (
					<Select
						clearable={false}
						data={typologyOptions}
						disabled={!values.agency_id}
						error={fieldState.error?.message}
						label={t('lines:create.LineCreateBasicInfo.typology')}
						readOnly={!lineCreateContext.capabilities.editEnabled}
						w="100%"
						withAsterisk={!LineSchema.shape.typology.isOptional()}
						{...field}
						value={field.value || null}
					/>
				)}
			/>

		</Section>
	);

	//
}
