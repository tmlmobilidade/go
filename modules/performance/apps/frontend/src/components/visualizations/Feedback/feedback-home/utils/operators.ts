/* * */

import { type Agency } from '@tmlmobilidade/types';

/* * */

export function getOperatorCode(operator: Agency) {
	return operator.short_name || operator.code || operator._id;
}

export function getOperatorName(operator: Agency) {
	return operator.public_name || operator.name || operator.short_name || operator._id;
}

export function sortOperatorsByCode(operators?: Agency[]) {
	if (!operators) return [];
	return [...operators].sort((a, b) => getOperatorCode(a).localeCompare(getOperatorCode(b), 'pt-PT'));
}
