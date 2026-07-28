/* * */

import { CmOperatorVideowall } from '@/agencies/cm/CmOperatorVideowall';
import { AGENCY_ROUTE_CONFIG } from '@/agencies/config';

/* * */

export function Agency41Videowall() {
	const agency = AGENCY_ROUTE_CONFIG[41];

	return (
		<CmOperatorVideowall
			agencyId={agency.agency_id}
			agencyLabel={agency.label}
			numberAnimation={agency.number_animation}
		/>
	);
}
