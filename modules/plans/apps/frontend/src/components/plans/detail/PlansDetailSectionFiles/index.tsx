'use client';

/* * */

import { FileComponent } from '@/components/common/FileComponent';
import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { Collapsible, Label, Section } from '@tmlmobilidade/ui';

/* * */

export function PlanDetailSectionFiles() {
	//

	//
	// A. Setup variables

	const planDetailContext = usePlanDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Ficheiros GTFS referentes a este plano."
			title="Ficheiros GTFS"
		>

			<Section gap="sm">
				{planDetailContext.data.operation_file ? (
					<FileComponent file={planDetailContext.data.operation_file} />
				) : (
					<Label>Nenhum ficheiro selecionado</Label>
				)}
			</Section>

		</Collapsible>
	);

	//
}
