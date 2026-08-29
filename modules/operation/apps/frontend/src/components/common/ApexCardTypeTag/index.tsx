/* * */

import { type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale } from '@tmlmobilidade/go-types-apex';
import { Tag, TagGroup } from '@tmlmobilidade/ui';

/* * */

interface ApexCardTypeTagProps {
	value: SimplifiedApexOnBoardRefund['card_physical_type'] | SimplifiedApexOnBoardSale['card_physical_type']
}

/* * */

export function ApexCardTypeTag({ value }: ApexCardTypeTagProps) {
	//

	if (!value && value !== '0') {
		return <Tag label="N/A" variant="muted" />;
	}

	if (value === '28') {
		return (
			<TagGroup tags={[
				{ filled: true, label: value, variant: 'secondary' },
				{ filled: true, label: 'Paper Receipt', variant: 'secondary' },
			]}
			/>
		);
	}

	//
}
