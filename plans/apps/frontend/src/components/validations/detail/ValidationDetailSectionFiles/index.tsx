/* * */

import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { IconFileTypeZip } from '@tabler/icons-react';
import { Collapsible, Label, Section } from '@tmlmobilidade/ui';
/* * */

export function ValidationDetailSectionFiles() {
	//

	//
	// A. Setup variables
	const validationDetailContext = useValidationDetailContext();

	//
	// B. Transform data

	//
	// C. Render components

	function renderFile() {
		return (
			<Section alignItems="flex-start" gap="md" justifyContent="flex-start">
				<Section flexDirection="row" gap="sm" padding="none">
					<IconFileTypeZip />
					<Label>{validationDetailContext.data.file.name}</Label>
				</Section>
			</Section>
		);
	}

	function renderEmpty() {
		return (
			<Section alignItems="flex-start" gap="md" justifyContent="flex-start">
				<Label>Nenhum ficheiro selecionado</Label>
			</Section>
		);
	}
	return (
		<Collapsible
			description="Ficheiros GTFS para a validação. O ficheiro deve ser um arquivo zip com os ficheiros GTFS."
			title="Ficheiros GTFS"
		>
			{validationDetailContext.data.file ? renderFile() : renderEmpty()}
		</Collapsible>
	);
}
