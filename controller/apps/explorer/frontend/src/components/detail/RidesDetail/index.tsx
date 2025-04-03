'use client';

/* * */

import { RidesDetailHeader } from '@/components/detail/RidesDetailHeader';
import { RidesDetailMap } from '@/components/detail/RidesDetailMap';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function RidesDetail() {
	return (
		<Pane header={[<RidesDetailHeader />]}>
			<RidesDetailMap />
		</Pane>
	);
}
