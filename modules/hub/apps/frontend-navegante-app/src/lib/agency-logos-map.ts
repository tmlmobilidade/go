/* * */

const AGENCY_ID_TO_SHORT_NAME = {
	1: 'ccfl',
	15: 'fertagus',
	16: 'mts',
	2: 'ml',
	21: 'mobi',
	3: 'cp',
	4: 'ttsl',
	41: 'cmet',
	42: 'cmet',
	43: 'cmet',
	44: 'cmet',
	8: 'tcb',
	CM: 'cmet',
};

type AgencyLogoSize = '120x120' | '180x120';

export function getAgencyLogo(agencyId: string, size: AgencyLogoSize, mode: 'dark' | 'light') {
	const shortName = AGENCY_ID_TO_SHORT_NAME[agencyId];
	return `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/navegante/agency-logos/${size}/navegante-agency-logo-${shortName}-${size}-${mode}.png`;
}
