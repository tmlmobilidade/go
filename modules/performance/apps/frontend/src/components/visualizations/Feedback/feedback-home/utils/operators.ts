import { type Agency } from '@tmlmobilidade/types';

/* * */

export function getOperatorName(operator: Agency) {
	return operator.public_name || operator.name || operator.short_name || operator._id;
}

export function sortOperatorsByCode(operators?: Agency[]) {
	if (!operators) return [];
	return [...operators].sort((a, b) => a._id.localeCompare(b._id, 'pt-PT'));
}
