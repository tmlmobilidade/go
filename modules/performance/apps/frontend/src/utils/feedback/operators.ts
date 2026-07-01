import type { Agency } from '@tmlmobilidade/types';

/* * */

const OPERATOR_ID_COLLATOR = new Intl.Collator('pt-PT', { numeric: true, sensitivity: 'base' });

/* * */

export function compareOperatorsByCode(operatorA: Agency, operatorB: Agency) {
	return OPERATOR_ID_COLLATOR.compare(operatorA._id, operatorB._id);
}

export function getOperatorName(operator: Agency) {
	return operator.public_name || operator.name || operator.short_name || operator._id;
}

export function sortOperatorsByCode(operators: Agency[] = []) {
	return [...operators].sort(compareOperatorsByCode);
}
