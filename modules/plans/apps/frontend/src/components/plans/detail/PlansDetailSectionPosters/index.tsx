'use client';

import { FileComponent } from '@/components/common/FileComponent';
import { usePlansExportPdfsContext } from '@/contexts/PlansExportPdfs.context';
import { Button, Collapsible, Label, Section, Spacer, useToast } from '@tmlmobilidade/ui';

import { usePlanDetailContext } from '../PlanDetail.context';

/* * */

export function PlanDetailSectionPosters() {
	//

	//
	// A. Setup variables

	const plansExportPdfsContext = usePlansExportPdfsContext();
	const planDetailContext = usePlanDetailContext();

	//
	// B. Handle actions

	const handleDownload = async () => {
		try {
			const fileUrl = planDetailContext.data.plan.apps?.posters?.file?.url;

			if (!fileUrl) {
				throw new Error('O ficheiro não está disponível para transferência');
			}

			window.open(fileUrl);
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
			description="Gerar PDFs referentes a este plano."
			title="Gerar PDFs"
		>
			<Section gap="sm">
				{planDetailContext.data.plan.apps?.posters?.status === 'complete' && planDetailContext.data.plan.apps?.posters?.file ? (
					<>
						<FileComponent
							fileData={planDetailContext.data.plan.apps.posters.file}
							onClick={handleDownload}
						/>
						<Spacer />
					</>
				) : null}
				<Button
					label="Gerar Posters PDF"
					loading={plansExportPdfsContext.flags.is_generating}
					onClick={plansExportPdfsContext.actions.generatePosters}
					variant="secondary"
				/>
				<Spacer />
				<Label size="sm" variant="warning" caps>AVISO - A geração de PDFs pode levar alguns minutos para ser concluída.</Label>
			</Section>
		</Collapsible>
	);

	//
}
