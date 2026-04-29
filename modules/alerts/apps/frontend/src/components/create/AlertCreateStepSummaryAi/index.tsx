'use client';

/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type I18nCode, PermissionCatalog } from '@tmlmobilidade/types';
import { Button, Section, Surface, Switch, TextInput, useHandleUpdate, useMeContext } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

type DescribeAlertReturnType = Record<I18nCode, {
	description: string
	title: string
}>;

/* * */

export function AlertCreateStepSummaryAi() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const meContext = useMeContext();
	const alertCreateContext = useAlertCreateContext();

	//
	// B. Transform data

	const hasPermissionToCreate = meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.create,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertCreateContext.data.form.getValues().agency_id,
		},
		{
			action: PermissionCatalog.all.alerts.actions.create,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertCreateContext.data.form.getValues().reference_type,
		},
	]);

	const hasPermissionToEditTexts = meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertCreateContext.data.form.getValues().agency_id,
		},
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertCreateContext.data.form.getValues().reference_type,
		},
	]);

	//
	// C. Handle actions

	const { action: generateText, isLoading: isLoadingGeneratingText } = useHandleUpdate<DescribeAlertReturnType>({
		fetchFn: async () => {
			// Skip if auto texts is not enabled
			if (!alertCreateContext.data.form.getValues().auto_texts) return;
			// Skip if required fields for templating are not filled
			if (!alertCreateContext.data.form.getValues().cause) return;
			if (!alertCreateContext.data.form.getValues().effect) return;
			if (!alertCreateContext.data.form.getValues().reference_type) return;
			if (!alertCreateContext.data.form.getValues().references?.length) return;
			// Generate alert templating and set title and description based on i
			return await fetchData<DescribeAlertReturnType>(API_ROUTES.alerts.ALERTS_DESCRIBE, 'POST', {
				active_period_end_date: alertCreateContext.data.form.getValues().active_period_end_date,
				active_period_start_date: alertCreateContext.data.form.getValues().active_period_start_date,
				agency_id: alertCreateContext.data.form.getValues().agency_id,
				cause: alertCreateContext.data.form.getValues().cause,
				effect: alertCreateContext.data.form.getValues().effect,
				reference_type: alertCreateContext.data.form.getValues().reference_type,
				references: alertCreateContext.data.form.getValues().references,
				user_instructions: alertCreateContext.data.form.getValues().user_instructions,
			});
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error generating alert description', { error });
		},
		onSuccess: (data) => {
			alertCreateContext.data.form.setFieldValue('description', data.pt.description);
			alertCreateContext.data.form.setFieldValue('title', data.pt.title);
		},
	});

	const initialGeneration = useRef(false);

	useEffect(() => {
		if (initialGeneration.current) return;
		initialGeneration.current = true;
		(async () => await generateText())();
		// Run only once:
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
						key={alertCreateContext.data.form.key('auto_texts')}
						label={t('default:alerts.create.summary.auto_texts.label')}
						{...alertCreateContext.data.form.getInputProps('auto_texts', { type: 'checkbox' })}
					/>
				)}

				{(alertCreateContext.data.form.getValues().auto_texts && hasPermissionToCreate) && (
					<>
						<TextInput
							key={alertCreateContext.data.form.key('user_instructions')}
							label={t('default:alerts.create.summary.user_instructions.label')}
							placeholder={t('default:alerts.create.summary.user_instructions.placeholder')}
							readOnly={isLoadingGeneratingText}
							w="100%"
							{...alertCreateContext.data.form.getInputProps('user_instructions')}
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
