'use client';

import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { normalizeAlertCoordinatesInput } from '@/lib/alert-coordinates';
import { IconLink } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type I18nCode, PermissionCatalog } from '@tmlmobilidade/types';
import { Button, Collapsible, ContextFormController, CoordinatesInput, Grid, ImageUpload, Section, Surface, Switch, Textarea, TextInput, useContextFormWatch, useHandleUpdate, useMeContext } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useTranslation } from 'react-i18next';

/* * */

type DescribeAlertReturnType = Record<I18nCode, {
	description: string
	title: string
}>;

/* * */

export function AlertDetailSectionTexts() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const meContext = useMeContext();
	const alertDetailContext = useAlertDetailContext();

	const autoTextsValue = useContextFormWatch({ control: alertDetailContext.form.instance.control, name: 'auto_texts' });

	//
	// B. Transform data

	const hasPermissionToUpdate = meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.update,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertDetailContext.data.alert.agency_id,
		},
		{
			action: PermissionCatalog.all.alerts.actions.update,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertDetailContext.data.alert.reference_type,
		},
	]);

	const hasPermissionToUpdateTexts = meContext.actions.hasPermissionResource([
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

	return (
		<Collapsible
			description="Breve descrição do que motivou a criação do alerta"
			title="Título e Descrição"
			defaultOpen
		>
			<Section gap="md">

				<Surface variant="bordered" withBackground>

					<Section gap="md">

						<ContextFormController
							control={alertDetailContext.form.instance.control}
							name="auto_texts"
							render={({ field }) => (
								<Switch
									checked={field.value ?? false}
									disabled={!hasPermissionToUpdateTexts && !hasPermissionToUpdate}
									label={t('default:alerts.create.summary.auto_texts.label')}
									onChange={e => field.onChange(e.currentTarget.checked)}
								/>
							)}
						/>

						{autoTextsValue && (
							<>
								<ContextFormController
									control={alertDetailContext.form.instance.control}
									name="user_instructions"
									render={({ field }) => (
										<TextInput
											disabled={isLoadingGeneratingText}
											label={t('default:alerts.create.summary.user_instructions.label')}
											onBlur={field.onBlur}
											onChange={e => field.onChange(e.currentTarget.value)}
											placeholder={t('default:alerts.create.summary.user_instructions.placeholder')}
											readOnly={!hasPermissionToUpdateTexts && !hasPermissionToUpdate}
											value={field.value ?? ''}
											w="100%"
										/>
									)}
								/>
								{(hasPermissionToUpdateTexts || hasPermissionToUpdate) && (
									<Button
										label={t('default:alerts.create.summary.generate_text.label')}
										loading={isLoadingGeneratingText}
										onClick={generateText}
									/>
								)}
							</>
						)}

					</Section>
				</Surface>

				<Grid gap="md">

					<ContextFormController
						control={alertDetailContext.form.instance.control}
						name="title"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('default:alerts.create.summary.title.label')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								readOnly={!hasPermissionToUpdateTexts}
								value={field.value ?? ''}
							/>
						)}
					/>

					<ContextFormController
						control={alertDetailContext.form.instance.control}
						name="description"
						render={({ field, fieldState }) => (
							<Textarea
								error={fieldState.error?.message}
								label={t('default:alerts.create.summary.description.label')}
								minRows={4}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								readOnly={!hasPermissionToUpdateTexts}
								value={field.value ?? ''}
								autosize
							/>
						)}
					/>

					<ContextFormController
						control={alertDetailContext.form.instance.control}
						name="coordinates"
						render={({ field }) => (
							<CoordinatesInput
								key="key"
								label={t('default:alerts.create.summary.coordinates.label')}
								onChange={nextValue => field.onChange(normalizeAlertCoordinatesInput(nextValue))}
								value={field.value ?? undefined}
							/>
						)}
					/>

					<ContextFormController
						control={alertDetailContext.form.instance.control}
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
								readOnly={!hasPermissionToUpdateTexts}
								value={field.value ?? ''}
							/>
						)}
					/>

					<ImageUpload
						label="Imagem"
						onChange={alertDetailContext.actions.setImageFile}
						onDelete={alertDetailContext.actions.deleteImage}
						value={alertDetailContext.data.image?.url}
					/>

				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
