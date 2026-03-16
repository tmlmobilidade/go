'use client';

/* * */

import { FileComponent } from '@/components/common/FileComponent';
import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Collapsible, Label, Section, useToast } from '@tmlmobilidade/ui';

/* * */

export function PlanDetailSectionFiles() {
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
			description="Ficheiros GTFS referentes a este plano."
			title="Ficheiros GTFS"
		>

			<Section gap="sm">
				{planDetailContext.data.operation_file ? (
					<FileComponent
						fileData={planDetailContext.data.operation_file}
						onClick={handleDownload}
					/>
				) : (
					<Label>Nenhum ficheiro selecionado</Label>
				)}
			</Section>

		</Collapsible>
	);

	//
}
