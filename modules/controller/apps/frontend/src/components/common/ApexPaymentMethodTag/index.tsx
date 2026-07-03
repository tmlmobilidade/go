/* * */

import { type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale } from '@tmlmobilidade/go-types-apex';
import { Tag, TagGroup } from '@tmlmobilidade/ui';

/* * */

interface ApexPaymentMethodTagProps {
	value: SimplifiedApexOnBoardRefund['payment_method'] | SimplifiedApexOnBoardSale['payment_method']
}

/* * */

export function ApexPaymentMethodTag({ value }: ApexPaymentMethodTagProps) {
	//

	if (!value && value !== '0') {
		return <Tag label="N/A" variant="muted" />;
	}

	if (value === '2') {
		return (
			<TagGroup tags={[
				{ filled: true, label: value, variant: 'secondary' },
				{ filled: true, label: 'Cash', variant: 'secondary' },
			]}
			/>
		);
	}

	//
}
