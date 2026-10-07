'use client';

import { IconLink } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Organization } from '@tmlmobilidade/go-types-core';
import { Alert } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, fetchApiMultipart, FileItem, Grid, HasPermission, Section, StandardFormController, Textarea, TextInput, useHandleAction } from '@tmlmobilidade/ui';
import { uploadFile } from '@tmlmobilidade/utils';
import { useTranslation } from 'react-i18next';

import { useAlertsDetailFormContext } from '../AlertsDetailForm.context';
import { useAlertsDetailData } from '../use-alerts-detail-data';
import { useAlertsDetailFileData } from '../use-alerts-detail-file-data';

/* * */

export function AlertsDetailSectionTextsForm() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useAlertsDetailFormContext();

	const { data: alertFileData } = useAlertsDetailFileData();

	//
	// B. Render components

	const { action: handleUploadFile, isLoading: isUploadingFile } = useHandleAction({
		fetchFn: async (imageFile: File) => {
			const formData = new FormData();
			formData.append('light', imageFile);
			return await fetchApiMultipart<Organization>(API_ROUTES.operation.ALERTS_DETAIL_IMAGE(organizationId), formData);
		},
		onSuccess: () => {
			organizationsImageDetailLightMutate();
		},
	});

	//
	// B. Render components

	return (
		<>

			<Section gap="md">
				<Grid gap="md">

					<StandardFormController
						control={form.control}
						name="title"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={!capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('alerts:create.summary.title.label')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								value={field.value ?? ''}
							/>
						)}
					/>

					<StandardFormController
						control={form.control}
						name="description"
						render={({ field, fieldState }) => (
							<Textarea
								disabled={!capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('alerts:create.summary.description.label')}
								minRows={4}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								value={field.value ?? ''}
								autosize
							/>
						)}
					/>

					{/* <StandardFormController
						control={form.control}
						name="coordinates"
						render={({ field }) => (
							<CoordinatesInput
								key="key"
								label={t('alerts:create.summary.coordinates.label')}
								// onChange={nextValue => field.onChange(normalizeAlertCoordinatesInput(nextValue))}
								value={field.value ?? undefined}
							/>
						)}
					/> */}

					<StandardFormController
						control={form.control}
						name="info_url"
						render={({ field, fieldState }) => (
							<TextInput
								description={t('alerts:create.summary.info_url.description')}
								error={fieldState.error?.message}
								label={t('alerts:create.summary.info_url.label')}
								leftSection={<IconLink />}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder="https://www.cm-setubal.com/..."
								readOnly={!capabilities.editEnabled}
								value={field.value ?? ''}
							/>
						)}
					/>

				</Grid>
			</Section>

			{/* <Divider /> */}

			{alertFileData ? (
				<>
					<FileItem
						fileName={alertFileData.name}
						fileType={alertFileData.type}
						onDelete={capabilities.editEnabled && planDetailContext.actions.deleteApexFile}
						onDownload={handleDownload}
					/>
					<HasPermission
						action={PermissionCatalog.all.plans.actions.send_apex_notification}
						resourceKey="agency_ids"
						scope={PermissionCatalog.all.plans.scope}
						value={planDetailContext.data.plan?.agency_id ?? ''}
					>
						<Button
							label="Enviar notificação APEX"
							loading={isSendingApexNotification}
							onClick={handleSendApexNotification}
						/>
					</HasPermission>
				</>
			) : (
				hasPermissionUpdateApexFile ? (
					<FileUpload
						accept="application/zip"
						label="Selecionar Ficheiro de Configuração APEX"
						maxFileSize={5 * 1024 * 1024 * 1024} // 5 GB
						onFileChange={planDetailContext.actions.setApexFileUpload}
					/>
				) : (
					<NoDataLabel text="Nenhum ficheiro de configuração APEX associado a este plano." />
				)
			)}

		</>
	);
}
