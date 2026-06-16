/* * */

import { type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { Tag } from '@tmlmobilidade/ui';

/* * */

interface ApexValidationIsPassengerTagProps {
	value: SimplifiedApexValidation['is_passenger']
}

/* * */

export function ApexValidationIsPassengerTag({ value }: ApexValidationIsPassengerTagProps) {
	//

	if (value) {
		return <Tag label="Valid" variant="success" filled />;
	}

	return <Tag label="Not Valid" variant="danger" filled />;

	//
}
