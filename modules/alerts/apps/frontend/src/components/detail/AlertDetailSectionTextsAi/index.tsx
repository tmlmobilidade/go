'use client';

/* * */

import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type I18nCode, PermissionCatalog } from '@tmlmobilidade/types';
import { Button, Section, Surface, Switch, TextInput, useHandleUpdate, useMeContext } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { Controller } from 'react-hook-form';
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
			// Get latest form values
			const formValues = alertDetailContext.form.instance.getValues();
			// Skip if auto texts is not enabled
			if (!formValues.auto_texts) return;
			// Skip if required fields for templating are not filled
			if (!formValues.cause) return;
			if (!formValues.effect) return;
			if (!formValues.reference_type) return;
			if (!formValues.references?.length) return;
			// Generate alert templating and set title and description based on i
			return await fetchData<DescribeAlertReturnType>(API_ROUTES.alerts.ALERTS_DESCRIBE, 'POST', {
				active_period_end_date: formValues.active_period_end_date,
				active_period_start_date: formValues.active_period_start_date,
				agency_id: formValues.agency_id,
				cause: formValues.cause,
				effect: formValues.effect,
				reference_type: formValues.reference_type,
				references: formValues.references,
				user_instructions: formValues.user_instructions,
			});
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error generating alert description', { error });
		},
		onSuccess: (data) => {
			alertDetailContext.form.instance.setValue('description', data.pt.description, { shouldDirty: true });
			alertDetailContext.form.instance.setValue('title', data.pt.title, { shouldDirty: true });
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
					<Controller
						control={alertDetailContext.form.instance.control}
						name="auto_texts"
						render={({ field }) => (
							<Switch
								checked={field.value ?? false}
								label={t('default:alerts.create.summary.auto_texts.label')}
								onChange={e => field.onChange(e.currentTarget.checked)}
							/>
						)}
					/>
				)}

				{(alertDetailContext.form.instance.getValues().auto_texts && hasPermissionToCreate) && (
					<>
						<Controller
							control={alertDetailContext.form.instance.control}
							name="user_instructions"
							render={({ field }) => (
								<TextInput
									disabled={isLoadingGeneratingText}
									label={t('default:alerts.create.summary.user_instructions.label')}
									onBlur={field.onBlur}
									onChange={e => field.onChange(e.currentTarget.value)}
									placeholder={t('default:alerts.create.summary.user_instructions.placeholder')}
									readOnly={isLoadingGeneratingText}
									value={field.value ?? ''}
									w="100%"
								/>
							)}
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
