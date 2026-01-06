'use client';

/* * */

import { usePeriodCreateContext } from '@/components/periods/create/PeriodsCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { PeriodSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { ColorInput, Section, Select, TextInput, useDataAgencies } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PeriodCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const periodCreateContext = usePeriodCreateContext();
	const { t } = useTranslation('dates');

	const { options: allAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.periods.actions.create],
		scope: PermissionCatalog.all.periods.scope,
	});

	//
	// B. Render Components

	return (
		<Section gap="md">
			<TextInput
				label={t('periods.create.BasicInfo.fields.name.label')}
				placeholder={t('periods.create.BasicInfo.fields.name.placeholder')}
				required={!PeriodSchema.shape.name.isOptional()}
				w="100%"
				{...periodCreateContext.data.form.getInputProps('name')}
			/>

			<Select
				data={allAgencyOptions}
				label={t('periods.create.BasicInfo.fields.agency_id.label')}
				w="100%"
				{...periodCreateContext.data.form.getInputProps('agency_id')}
			/>

			<ColorInput
				label={t('periods.create.BasicInfo.fields.color.label')}
				required={!PeriodSchema.shape.color.isOptional()}
				withEyeDropper={false}
				{...periodCreateContext.data.form.getInputProps('color')}
			/>
		</Section>
	);

	//
}
