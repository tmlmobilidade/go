/* * */

import { AGENCY_INFO, type AgencyId } from '@/agencies/config';

/* * */

type AgencyLogoSize = '120x120' | '180x120';

export function getAgencyLogo(agencyId: AgencyId, size: AgencyLogoSize, mode: 'dark' | 'light') {
	const agency = AGENCY_INFO[agencyId];
	return `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/navegante/agency-logos/${size}/navegante-agency-logo-${agency.logo_slug}-${size}-${mode}.png`;
}
