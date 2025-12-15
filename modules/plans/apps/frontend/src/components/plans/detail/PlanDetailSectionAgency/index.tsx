/* * */

import { AgencyDisplay } from '@/components/common/AgencyDisplay';
import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { Collapsible, Section } from '@tmlmobilidade/ui';

/* * */

export function PlanDetailSectionAgency() {
	//

	//
	// A. Setup variables

	const planDetailContext = usePlanDetailContext();

	//
	// B. Render components

	if (!planDetailContext.data.plan?.gtfs_agency) {
		return null;
	}

	return (
		<Collapsible
			description="Resumo dos dados do operador extraídos do ficheiro agency.txt"
			title="Dados do Operador"
		>
			<Section gap="sm">
				<AgencyDisplay data={planDetailContext.data.plan.gtfs_agency} />
			</Section>
		</Collapsible>
	);

	//
}
