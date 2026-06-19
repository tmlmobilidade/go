'use client';

import { usePlansExportPdfsContext } from '@/contexts/PlansExportPdfs.context';
import { Button, Collapsible, Section } from '@tmlmobilidade/ui';

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
				/>
			</Section>
		</Collapsible>
	);

	//
}
