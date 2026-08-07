/* * */

import { CmOperatorVideowall } from '@/agencies/cm/CmOperatorVideowall';
import { AGENCY_ROUTE_CONFIG } from '@/agencies/config';

/* * */

export function Agency41Videowall() {
	return <CmOperatorVideowall agency={AGENCY_ROUTE_CONFIG[41]} />;
}
