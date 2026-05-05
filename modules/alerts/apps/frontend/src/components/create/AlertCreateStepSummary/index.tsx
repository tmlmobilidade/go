/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { IconLink } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type I18nCode, PermissionCatalog } from '@tmlmobilidade/types';
import { Button, ContextFormController, CoordinatesInput, Grid, Section, Surface, Switch, Textarea, TextInput, useContextFormWatch, useHandleUpdate, useMeContext } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

type DescribeAlertReturnType = Record<I18nCode, {
	description: string
	title: string
}>;

/* * */

export function AlertCreateStepSummary() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const meContext = useMeContext();
	const alertCreateContext = useAlertCreateContext();

	const agencyIdValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'agency_id' });
	const referenceTypeValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'reference_type' });
	const autoTextsValue = useContextFormWatch({ control: alertCreateContext.form.instance.control, name: 'auto_texts' });

	//
	// B. Transform data

	const hasPermissionToCreate = meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.create,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: agencyIdValue,
		},
		{
			action: PermissionCatalog.all.alerts.actions.create,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: referenceTypeValue,
		},
	]);

	const hasPermissionToEditTexts = meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: agencyIdValue,
		},
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: referenceTypeValue,
		},
	]);

	//
	// C. Handle actions

	const { action: generateText, isLoading: isLoadingGeneratingText } = useHandleUpdate<DescribeAlertReturnType>({
		fetchFn: async () => {
			const formValues = alertCreateContext.form.instance.getValues();
			if (!formValues.auto_texts) return;
			if (!formValues.cause) return;
			if (!formValues.effect) return;
			if (!formValues.reference_type) return;
			if (!formValues.references?.length) return;
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
			alertCreateContext.form.instance.setValue('description', data.pt.description, { shouldDirty: true });
			alertCreateContext.form.instance.setValue('title', data.pt.title, { shouldDirty: true });
		},
	});

	const initialGeneration = useRef(false);

	useEffect(() => {
		if (initialGeneration.current) return;
		initialGeneration.current = true;
		(async () => await generateText())();
	}, [generateText]);

	//
	// C. Render components

	return (
		<Section gap="md">
			<Grid gap="md">

				<Surface variant="bordered" withBackground>
					<Section gap="md">
						{(hasPermissionToCreate || hasPermissionToEditTexts) && (
							<ContextFormController
								control={alertCreateContext.form.instance.control}
								name="auto_texts"
								render={({ field }) => (
									<Switch
										checked={field.value ?? false}
										disabled={!hasPermissionToEditTexts}
										label={t('default:alerts.create.summary.auto_texts.label')}
										onChange={e => field.onChange(e.currentTarget.checked)}
									/>
								)}
							/>
						)}
						{(autoTextsValue && hasPermissionToCreate) && (
							<>
								<ContextFormController
									control={alertCreateContext.form.instance.control}
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

				<ContextFormController
					control={alertCreateContext.form.instance.control}
					name="title"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('default:alerts.create.summary.title.label')}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							readOnly={!hasPermissionToEditTexts}
							value={field.value ?? ''}
						/>
					)}
				/>

				<ContextFormController
					control={alertCreateContext.form.instance.control}
					name="description"
					render={({ field, fieldState }) => (
						<Textarea
							error={fieldState.error?.message}
							label={t('default:alerts.create.summary.description.label')}
							minRows={4}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							readOnly={!hasPermissionToEditTexts}
							value={field.value ?? ''}
							autosize
						/>
					)}
				/>

				<ContextFormController
					control={alertCreateContext.form.instance.control}
					name="coordinates"
					render={({ field }) => (
						<CoordinatesInput
							key="key"
							defaultValue={field.value}
							label={t('default:alerts.create.summary.coordinates.label')}
							onChange={field.onChange}
						/>
					)}
				/>

				<ContextFormController
					control={alertCreateContext.form.instance.control}
					name="info_url"
					render={({ field, fieldState }) => (
						<TextInput
							description={t('default:alerts.create.summary.info_url.description')}
							error={fieldState.error?.message}
							label={t('default:alerts.create.summary.info_url.label')}
							leftSection={<IconLink />}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder="https://www.cm-setubal.com/..."
							readOnly={!hasPermissionToEditTexts}
							value={field.value ?? ''}
						/>
					)}
				/>

			</Grid>
		</Section>
	);

	//
}
