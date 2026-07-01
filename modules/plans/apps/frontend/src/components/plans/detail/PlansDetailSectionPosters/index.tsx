'use client';

import { FileComponent } from '@/components/common/FileComponent';
import { usePlansExportPdfsContext } from '@/contexts/PlansExportPdfs.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
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
			const postersFile = planDetailContext.data.posters_file;

			if (!postersFile) {
				throw new Error('O ficheiro não está disponível para transferência');
			}

			const response = await fetch(API_ROUTES.plans.PLANS_DETAIL_POSTERS_FILE_DOWNLOAD(planDetailContext.data.id), {
				credentials: 'include',
			});

			if (!response.ok) {
				throw new Error('Erro ao transferir ficheiro');
			}

			const fileUrl = URL.createObjectURL(await response.blob());
			const link = document.createElement('a');
			link.href = fileUrl;
			link.download = response.headers.get('Content-Disposition')?.split('filename=')[1] ?? 'planos pdf.zip';
			document.body.append(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(fileUrl);
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
				{planDetailContext.data.plan.apps?.posters?.status === 'complete' && planDetailContext.data.posters_file ? (
					<>
						<FileComponent
							fileData={planDetailContext.data.posters_file}
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
