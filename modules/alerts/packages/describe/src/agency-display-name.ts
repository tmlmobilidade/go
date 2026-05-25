/* * */

/**
 * Full passenger-facing operator label for CM area agencies (41–44).
 * Other agencies keep their database name.
 */
const CM_AREA_DESCRIPTION_LABELS: Record<string, string> = {
	41: 'Carris Metropolitana (Área 1)',
	42: 'Carris Metropolitana (Área 2)',
	43: 'Carris Metropolitana (Área 3)',
	44: 'Carris Metropolitana (Área 4)',
};

/**
 * Short label reserved for agency titles.
 */
const CM_AREA_TITLE_LABELS: Record<string, string> = {
	41: 'CM (Área 1)',
	42: 'CM (Área 2)',
	43: 'CM (Área 3)',
	44: 'CM (Área 4)',
};

/**
 * Returns the full passenger-facing label to use in descriptions.
 * @param agencyId Alert agency_id.
 * @param agencyName Fallback from agencies collection (legal/trade name).
 */
export function getAgencyPassengerFacingName(agencyId: string, agencyName: string): string {
	return CM_AREA_DESCRIPTION_LABELS[agencyId] ?? agencyName;
}

/**
 * Returns the shorter title label when one exists for the operator.
 * Falls back to the regular passenger-facing label for non-CM operators.
 * @param agencyId Alert agency_id.
 * @param agencyName Fallback from agencies collection (legal/trade name).
 */
export function getAgencyTitleLabel(agencyId: string, agencyName: string): string {
	return CM_AREA_TITLE_LABELS[agencyId] ?? getAgencyPassengerFacingName(agencyId, agencyName);
}

/**
 * Short area label for title prefixes when needed (e.g. "Área 1").
 */
export function getAgencyAreaLabel(agencyId: string): string | undefined {
	const match = CM_AREA_DESCRIPTION_LABELS[agencyId]?.match(/Área \d/);
	return match?.[0];
}
