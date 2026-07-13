'use client';

import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Collapsible, FileItem, FileUpload, Label, Section, useMeContext, useToast } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function PlanDetailSectionApexFile() {
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
			value: planDetailContext.data.plan?.gtfs_agency.agency_id ?? '',
		});
	}, [meContext.actions, planDetailContext.data.plan?.gtfs_agency.agency_id]);

	const hasPermissionDeleteApexFile = useMemo(() => {
		return meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.delete_apex_file,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planDetailContext.data.plan?.gtfs_agency.agency_id ?? '',
		});
	}, [meContext.actions, planDetailContext.data.plan?.gtfs_agency.agency_id]);

	//
	// C. Handle actions

	const handleDownload = async () => {
		try {
			// Open file.url in a new window
			window.open(API_ROUTES.plans.PLANS_DETAIL_APEX_FILE_DOWNLOAD(planDetailContext.data.id), '_blank');
		} catch (error) {
			useToast.error({
				message: error instanceof Error ? error.message : 'Erro ao transferir ficheiro',
				title: 'Erro ao transferir ficheiro',
			});
		}
	};

	//
	// D. Render components

	return (
		<Collapsible
			description="Ficheiro de configuração APEX."
			title="Ficheiro de Configuração APEX"
		>
			<Section gap="sm">

				{planDetailContext.data.apex_file ? (
					<FileItem
						fileName={planDetailContext.data.apex_file.name}
						fileType={planDetailContext.data.apex_file.type}
						onDelete={hasPermissionDeleteApexFile && planDetailContext.actions.deleteApexFile}
						onDownload={handleDownload}
					/>
				) : (
					hasPermissionUpdateApexFile ? (
						<FileUpload
							accept="application/zip"
							label="Selecionar Ficheiro de Configuração APEX"
							maxFileSize={5 * 1024 * 1024 * 1024} // 5 GB
							onFileChange={planDetailContext.actions.setApexFileUpload}
						/>
					) : (
						<Label variant="muted">
							Nenhum ficheiro de configuração APEX associado a este plano.
						</Label>
					)
				)}

			</Section>
		</Collapsible>
	);
}
