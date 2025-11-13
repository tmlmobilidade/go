/* * */

import { AgencyDisplay } from '@/components/common/AgencyDisplay';
import { usePlansDetailContext } from '@/contexts/PlansDetail.context';
import { Collapsible, Section } from '@tmlmobilidade/ui';

/* * */

export function PlansDetailSectionAgency() {
	//

	//
	// A. Setup variables

	const plansDetailContext = usePlansDetailContext();

	//
	// B. Render components

	if (!plansDetailContext.data.plan?.gtfs_agency) {
		return null;
	}

	return (
		<Collapsible
			description="Resumo dos dados do operador extraídos do ficheiro agency.txt"
			title="Dados do Operador"
		>
			<Section gap="sm">
				<AgencyDisplay data={plansDetailContext.data.plan.gtfs_agency} />
			</Section>
		</Collapsible>
	);

	//
}
