'use client';

import { usePlanDetailContext } from '@/components/plans/detail/PlanDetailForm.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, Collapsible, fetchApiData, FileItem, FileUpload, HasPermission, NoDataLabel, Section, useHandleAction, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function PlansDetailSectionApexConfig() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const planDetailContext = usePlanDetailContext();

	//
	// B. Transform data

	const hasPermissionUpdateApexFile = useMemo(() => {
		return meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.update_apex_file,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planDetailContext.data.plan?.agency_id ?? '',
		});
	}, [meContext.actions, planDetailContext.data.plan?.agency_id]);

	const hasPermissionDeleteApexFile = useMemo(() => {
		return meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.delete_apex_file,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planDetailContext.data.plan?.agency_id ?? '',
		});
	}, [meContext.actions, planDetailContext.data.plan?.agency_id]);

	//
	// C. Handle actions

	const handleDownload = async () => {
		window.open(API_ROUTES.operation.PLANS_DETAIL_APEX_CONFIG_DOWNLOAD(planDetailContext.data.id), '_blank');
	};

	const { action: handleSendApexNotification, isLoading: isSendingApexNotification } = useHandleAction({
		fetchFn: async () => await fetchApiData<unknown>({ url: API_ROUTES.operation.PLANS_DETAIL_APEX_CONFIG_SEND_NOTIFICATION(planDetailContext.data.id) }),
		onSuccess: () => {},
	});

	//
	// D. Render components

	return (
		<Collapsible
			description="Ficheiro de configuração APEX."
			title="Ficheiro de Configuração APEX"
		>
			<Section gap="sm">

				{planDetailContext.data.apex_file ? (
					<>
						<FileItem
							fileName={planDetailContext.data.apex_file.name}
							fileType={planDetailContext.data.apex_file.type}
							onDelete={hasPermissionDeleteApexFile && planDetailContext.actions.deleteApexFile}
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

			</Section>
		</Collapsible>
	);
}
