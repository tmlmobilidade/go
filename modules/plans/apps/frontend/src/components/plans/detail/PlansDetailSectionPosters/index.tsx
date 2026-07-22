'use client';

import { usePlansExportPdfsContext } from '@/contexts/PlansExportPdfs.context';
import { mimeTypes } from '@tmlmobilidade/consts';
import { Button, Collapsible, FileItem, Label, Section, Spacer, useToast } from '@tmlmobilidade/ui';

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

	const handleDownload = () => {
		try {
			const fileUrl = planDetailContext.data.posters_file?.url;

			if (!fileUrl) {
				throw new Error('O ficheiro não está disponível para transferência');
			}

			window.open(fileUrl, '_blank');
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
				{planDetailContext.data.plan.apps?.posters?.status === 'complete' ? (
					<>
						<Label size="sm" variant="success" caps>PDFs gerados com sucesso.</Label>
						{planDetailContext.data.posters_file ? (
							<FileItem
								fileName={planDetailContext.data.posters_file.name}
								fileType={mimeTypes.pdf}
								onDownload={handleDownload}
							/>
						) : null}
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
