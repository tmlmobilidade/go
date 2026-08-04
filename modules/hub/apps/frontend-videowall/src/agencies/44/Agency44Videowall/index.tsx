/* * */

import { CmOperatorVideowall } from '@/agencies/cm/CmOperatorVideowall';
import { AGENCY_ROUTE_CONFIG } from '@/agencies/config';

/* * */

export function Agency44Videowall() {
	const agency = AGENCY_ROUTE_CONFIG[44];

	return (
		<CmOperatorVideowall
			agencyId={agency.agency_id}
			agencyName={agency.name}
			areaNumber={agency.area_number}
			numberAnimation={agency.number_animation}
		/>
	);
}
