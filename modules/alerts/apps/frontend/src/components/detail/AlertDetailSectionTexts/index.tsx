'use client';

/* * */

import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { AlertDetailSectionTextsAi } from '@/components/detail/AlertDetailSectionTextsAi';
import { IconLink } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Collapsible, CoordinatesInput, Grid, ImageUpload, Section, Textarea, TextInput, useMeContext } from '@tmlmobilidade/ui';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertDetailSectionTexts() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const meContext = useMeContext();
	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const hasPermissionToEdit = meContext.actions.hasPermissionResource([
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
	// C. Render components

	return (
		<Collapsible
			description="Breve descrição do que motivou a criação do alerta"
			title="Título e Descrição"
			defaultOpen
		>
			<Section gap="md">
				<Grid gap="md">

					<Controller
						control={alertDetailContext.form.instance.control}
						name="title"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('default:alerts.create.summary.title.label')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								readOnly={!hasPermissionToEdit}
								value={field.value ?? ''}
							/>
						)}
					/>

					<Controller
						control={alertDetailContext.form.instance.control}
						name="description"
						render={({ field, fieldState }) => (
							<Textarea
								error={fieldState.error?.message}
								label={t('default:alerts.create.summary.description.label')}
								minRows={4}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								readOnly={!hasPermissionToEdit}
								value={field.value ?? ''}
								autosize
							/>
						)}
					/>

					<AlertDetailSectionTextsAi />

					<Controller
						control={alertDetailContext.form.instance.control}
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

					<Controller
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
