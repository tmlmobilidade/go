/* * */

import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { Collapsible, Grid, Label, Section, Text } from '@tmlmobilidade/ui';

/* * */

export function ValidationDetailSectionAgency() {
	//

	//
	// A. Setup variables

	const validationDetailContext = useValidationDetailContext();

	//
	// B. Render components

	if (!validationDetailContext.data.validation?.gtfs_agency) {
		return null;
	}

	return (
		<Collapsible
			description="Resumo dos dados do operador extraídos do ficheiro agency.txt"
			title="Dados do Operador"
		>
			<Section gap="sm">
				<Grid columns="abc" gap="sm">
					<Section padding="none">
						<Label size="sm" caps>Agência</Label>
						<Text size="base">{validationDetailContext.data.validation.gtfs_agency.agency_id} - {validationDetailContext.data.validation.gtfs_agency.agency_name ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL da agência</Label>
						<Text size="base">{validationDetailContext.data.validation.gtfs_agency.agency_url ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>Email de contacto</Label>
						<Text size="base">{validationDetailContext.data.validation.gtfs_agency.agency_email ?? 'N/A'}</Text>
					</Section>
					<Section padding="none">
						<Label size="sm" caps>URL de contacto</Label>
						<Text size="base">{validationDetailContext.data.validation.gtfs_agency.agency_url ?? 'N/A'}</Text>
					</Section>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
