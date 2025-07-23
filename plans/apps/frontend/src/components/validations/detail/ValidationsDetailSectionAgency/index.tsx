/* * */

import { LabelValueCard } from '@/components/common/LabelValueCard';
import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function ValidationsDetailSectionAgency() {
	//

	//
	// A. Setup variables

	const validationsDetailContext = useValidationsDetailContext();

	//
	// B. Render components

	if (!validationsDetailContext.data.validation?.gtfs_agency) {
		return null;
	}

	return (
		<Collapsible
			description="Resumo dos dados do operador extraídos do ficheiro agency.txt"
			title="Dados do Operador"
		>
			<Section gap="sm">
				<Grid columns="abc" gap="lg">
					<LabelValueCard label="agency_id" value={validationsDetailContext.data.validation.gtfs_agency?.agency_id || 'N/A'} />
					<LabelValueCard label="agency_name" value={validationsDetailContext.data.validation.gtfs_agency?.agency_name || 'N/A'} />
					<LabelValueCard label="agency_url" value={validationsDetailContext.data.validation.gtfs_agency?.agency_url || 'N/A'} />
					<LabelValueCard label="agency_email" value={validationsDetailContext.data.validation.gtfs_agency?.agency_email || 'N/A'} />
					<LabelValueCard label="agency_timezone" value={validationsDetailContext.data.validation.gtfs_agency?.agency_timezone || 'N/A'} />
					<LabelValueCard label="agency_fare_url" value={validationsDetailContext.data.validation.gtfs_agency?.agency_fare_url || 'N/A'} />
					<LabelValueCard label="agency_lang" value={validationsDetailContext.data.validation.gtfs_agency?.agency_lang || 'N/A'} />
					<LabelValueCard label="agency_phone" value={validationsDetailContext.data.validation.gtfs_agency?.agency_phone || 'N/A'} />
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
