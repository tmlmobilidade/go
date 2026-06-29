import { type Agency } from '@tmlmobilidade/types';

/* * */

const OPERATOR_ID_COLLATOR = new Intl.Collator('pt-PT', { numeric: true, sensitivity: 'base' });

/* * */

export function getOperatorName(operator: Agency) {
	return operator.public_name || operator.name || operator.short_name || operator._id;
}

export function sortOperatorsByCode(operators: Agency[] = []) {
	return [...operators].sort((a, b) => OPERATOR_ID_COLLATOR.compare(a._id, b._id));
}
