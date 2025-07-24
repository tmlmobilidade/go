/* * */

import { Tag } from '@tmlmobilidade/ui';

/* * */

interface PlansListCellIsLockedProps {
	value: boolean
}

/* * */

export function PlansListCellIsLocked({ value }: PlansListCellIsLockedProps) {
	//

	if (value === true) {
		return <Tag label="LOCKED" variant="success" filled />;
	}

	return <Tag label="UNLOCKED" variant="warning" filled />;

	//
}
