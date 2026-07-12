'use client';

import { FileComponent } from '@/components/common/FileComponent';
import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Collapsible, FileUpload, Section, useToast } from '@tmlmobilidade/ui';

/* * */

export function PlanDetailSectionApexFile() {
	//

	//
	// A. Setup variables

	const planDetailContext = usePlanDetailContext();

	//
	// B. Handle actions

	const handleDownload = async () => {
		try {
			// Open file.url in a new window
			window.open(API_ROUTES.plans.PLANS_DETAIL_OPERATION_FILE_DOWNLOAD(planDetailContext.data.id), '_blank');
		} catch (error) {
			useToast.error({
				message: error instanceof Error ? error.message : 'Erro ao transferir ficheiro',
				title: 'Erro ao transferir ficheiro',
			});
		}
	};

	//
	// C. Render components

	return (
		<Collapsible
			description="Ficheiro de configuração APEX."
			title="Ficheiro APEX"
		>
			<Section gap="sm">

				{planDetailContext.data.apex_file ? (
					<FileComponent
						fileData={planDetailContext.data.apex_file}
						onClick={handleDownload}
					/>
				) : (
					<FileUpload
						accept="application/zip"
						label="Selecionar Ficheiro APEX"
						maxFileSize={5 * 1024 * 1024 * 1024} // 5 GB
						onFileChange={planDetailContext.actions.setApexFileUpload}
					/>
				)}

			</Section>
		</Collapsible>
	);
}
