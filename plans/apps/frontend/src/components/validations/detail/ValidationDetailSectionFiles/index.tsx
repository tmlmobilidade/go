/* * */

import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { IconFileTypeZip } from '@tabler/icons-react';
import { Button, Collapsible, Label, Section } from '@tmlmobilidade/ui';
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

	return (
		<Collapsible
			description="Ficheiros GTFS para o validação. O ficheiro deve ser um arquivo zip com os ficheiros GTFS."
			title="Ficheiros GTFS"
		>
			<Section alignItems="flex-start" gap="md" justifyContent="flex-start">
				<Section flexDirection="row" gap="sm" padding="none">
					<IconFileTypeZip />
					<Label>{validationDetailContext.data.file?.name}</Label>
				</Section>
				<Button
					href={validationDetailContext.data.file.url}
					label="Download"
					target="_blank"
					variant="primary"
				/>
			</Section>
		</Collapsible>
	);
}
