const AGENCY_ID_TO_LOGO_SHORT_NAME: Record<string, string> = {
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

export function getOperatorLogoSrc(operatorId: string) {
	const shortName = AGENCY_ID_TO_LOGO_SHORT_NAME[operatorId];
	if (!shortName) return;

	return `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/navegante/agency-logos/180x120/navegante-agency-logo-${shortName}-180x120-light.png`;
}
