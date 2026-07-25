/* * */

const AGENCY_ID_TO_SHORT_NAME = {
	'7NTB1': 'fertagus',
	'A2L1N': 'cmet',
	'A3H3M': 'tcb',
	'BNA17': 'cmet',
	'CM': 'cmet',
	'HF16N': 'mobi',
	'IA2N9': 'ml',
	'IA9T6': 'ccfl',
	'KB1F6': 'mts',
	'LA77N': 'cmet',
	'LTP61': 'ttsl',
	'N18KL': 'cp',
	'YA15B': 'cmet',
};

type AgencyLogoSize = '120x120' | '180x120';

export function getAgencyLogo(agencyId: string, size: AgencyLogoSize, mode: 'dark' | 'light') {
	const shortName = AGENCY_ID_TO_SHORT_NAME[agencyId];
	return `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/navegante/agency-logos/${size}/navegante-agency-logo-${shortName}-${size}-${mode}.png`;
}
