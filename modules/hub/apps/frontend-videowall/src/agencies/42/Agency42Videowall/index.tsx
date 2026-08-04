/* * */

import { CmOperatorVideowall } from '@/agencies/cm/CmOperatorVideowall';
import { AGENCY_ROUTE_CONFIG } from '@/agencies/config';

/* * */

export function Agency42Videowall() {
	const agency = AGENCY_ROUTE_CONFIG[42];

	return (
		<CmOperatorVideowall
			agencyId={agency.agency_id}
			agencyName={agency.name}
			areaNumber={agency.area_number}
			numberAnimation={agency.number_animation}
		/>
	);
}
