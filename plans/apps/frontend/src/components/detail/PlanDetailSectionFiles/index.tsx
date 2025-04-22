/* * */

import { UploadFile } from '@/components/common/UploadFile';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function PlanDetailSectionFiles() {
	//

	//
	// A. Setup variables

	//
	// B. Transform data

	//
	// C. Render components

	return (
		<Collapsible
			description="Ficheiros GTFS para o plano. O ficheiro deve ser um arquivo zip com os ficheiros GTFS."
			title="Ficheiros GTFS"
		>
			<Section gap="md">
				<Grid columns="ab" gap="md">
					<UploadFile
						label="Plano de Referencia (GO)"
					/>
					<UploadFile
						label="Plano de Operação (Operador)"
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
