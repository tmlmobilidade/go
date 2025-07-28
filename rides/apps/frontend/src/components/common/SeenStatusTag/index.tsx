/* * */

import { type RideNormalized } from '@/types/normalized';
import { Indicator } from '@tmlmobilidade/ui';

/* * */

interface Props {
	value?: RideNormalized['seen_status']
}

/* * */

export function SeenStatusTag({ value }: Props) {
	//

	if (value === 'unseen') {
		return <Indicator variant="muted" />;
	}

	if (value === 'seen') {
		return <Indicator variant="primary" filled />;
	}

	if (value === 'gone') {
		return <Indicator variant="muted" filled />;
	}

	//
}
