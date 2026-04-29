'use client';

/* * */

import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type I18nCode, PermissionCatalog } from '@tmlmobilidade/types';
import { Button, Section, Surface, Switch, TextInput, useHandleUpdate, useMeContext } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useTranslation } from 'react-i18next';

/* * */

type DescribeAlertReturnType = Record<I18nCode, {
	description: string
	title: string
}>;

/* * */

export function AlertDetailSectionTextsAi() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const meContext = useMeContext();
	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const hasPermissionToCreate = meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.create,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertDetailContext.data.alert.agency_id,
		},
		{
			action: PermissionCatalog.all.alerts.actions.create,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertDetailContext.data.alert.reference_type,
		},
	]);

	const hasPermissionToEditTexts = meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertDetailContext.data.alert.agency_id,
		},
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertDetailContext.data.alert.reference_type,
		},
	]);

	//
	// C. Handle actions

	const { action: generateText, isLoading: isLoadingGeneratingText } = useHandleUpdate<DescribeAlertReturnType>({
		fetchFn: async () => {
			// Skip if auto texts is not enabled
			if (!alertDetailContext.data.form.getValues().auto_texts) return;
			// Skip if required fields for templating are not filled
			if (!alertDetailContext.data.form.getValues().cause) return;
			if (!alertDetailContext.data.form.getValues().effect) return;
			if (!alertDetailContext.data.form.getValues().reference_type) return;
			if (!alertDetailContext.data.form.getValues().references?.length) return;
			// Generate alert templating and set title and description based on i
			return await fetchData<DescribeAlertReturnType>(API_ROUTES.alerts.ALERTS_DESCRIBE, 'POST', {
				active_period_end_date: alertDetailContext.data.form.getValues().active_period_end_date,
				active_period_start_date: alertDetailContext.data.form.getValues().active_period_start_date,
				agency_id: alertDetailContext.data.form.getValues().agency_id,
				cause: alertDetailContext.data.form.getValues().cause,
				effect: alertDetailContext.data.form.getValues().effect,
				reference_type: alertDetailContext.data.form.getValues().reference_type,
				references: alertDetailContext.data.form.getValues().references,
				user_instructions: alertDetailContext.data.form.getValues().user_instructions,
			});
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error generating alert description', { error });
		},
		onSuccess: (data) => {
			alertDetailContext.data.form.setFieldValue('description', data.pt.description);
			alertDetailContext.data.form.setFieldValue('title', data.pt.title);
		},
	});

	//
	// D. Render components

	if (!hasPermissionToEditTexts) {
		return null;
	}

	return (
		<Surface variant="bordered" withBackground>

			<Section gap="md">

				{(hasPermissionToCreate || hasPermissionToEditTexts) && (
					<Switch
						key={alertDetailContext.data.form.key('auto_texts')}
						label={t('default:alerts.create.summary.auto_texts.label')}
						{...alertDetailContext.data.form.getInputProps('auto_texts', { type: 'checkbox' })}
					/>
				)}

				{(alertDetailContext.data.form.getValues().auto_texts && hasPermissionToCreate) && (
					<>
						<TextInput
							key={alertDetailContext.data.form.key('user_instructions')}
							disabled={isLoadingGeneratingText}
							label={t('default:alerts.create.summary.user_instructions.label')}
							placeholder={t('default:alerts.create.summary.user_instructions.placeholder')}
							readOnly={isLoadingGeneratingText}
							w="100%"
							{...alertDetailContext.data.form.getInputProps('user_instructions')}
						/>
						<Button
							label={t('default:alerts.create.summary.generate_text.label')}
							loading={isLoadingGeneratingText}
							onClick={generateText}
						/>
					</>
				)}

			</Section>
		</Surface>
	);

	//
}
