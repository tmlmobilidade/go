'use client';

import { usePlansExportPdfsContext } from '@/contexts/PlansExportPdfs.context';
import { Button, Collapsible, Label, Section, Spacer } from '@tmlmobilidade/ui';

/* * */

export function PlanDetailSectionPosters() {
	//

	//
	// A. Setup variables

	const plansExportPdfsContext = usePlansExportPdfsContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Posters em PDF referentes a este plano."
			title="Posters em PDF"
		>
			<Section gap="sm">
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
