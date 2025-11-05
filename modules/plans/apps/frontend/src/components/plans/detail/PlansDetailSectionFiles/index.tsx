'use client';

/* * */

import { FileComponent } from '@/components/common/FileComponent';
import { usePlansDetailContext } from '@/contexts/PlansDetail.context';
import { Collapsible, Label, Section } from '@tmlmobilidade/ui';

/* * */

export function PlansDetailSectionFiles() {
	//

	//
	// A. Setup variables

	const plansDetailContext = usePlansDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Ficheiros GTFS referentes a este plano."
			title="Ficheiros GTFS"
		>

			<Section gap="sm">
				{plansDetailContext.data.operation_file ? (
					<FileComponent file={plansDetailContext.data.operation_file} />
				) : (
					<Label>Nenhum ficheiro selecionado</Label>
				)}
			</Section>

		</Collapsible>
	);

	//
}
