/* * */

import { CmOperatorVideowall } from '@/agencies/cm/CmOperatorVideowall';
import { AGENCY_ROUTE_CONFIG } from '@/agencies/config';

/* * */

export function Agency43Videowall() {
	const agency = AGENCY_ROUTE_CONFIG[43];

	return (
		<CmOperatorVideowall
			agencyId={agency.agency_id}
			agencyName={agency.name}
			areaNumber={agency.area_number}
			numberAnimation={agency.number_animation}
		/>
	);
}
