/* * */

/** Day key for metric `data` from a Lisbon operational chunk ISO timestamp */
export const dayLabelFromStartIso = (startIso: string) => startIso.slice(0, 10);

/** Day key from operational date (`yyyyMMdd`) */
export const dayLabelFromOperationalDate = (operationalDate: string) =>
	`${operationalDate.slice(0, 4)}-${operationalDate.slice(4, 6)}-${operationalDate.slice(6, 8)}`;
