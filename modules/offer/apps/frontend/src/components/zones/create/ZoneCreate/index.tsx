'use client';

/* * */

import { ZoneCreateBasicInfo } from '@/components/zones/create/ZoneCreateBasicInfo';
import { ZoneCreateHeader } from '@/components/zones/create/ZoneCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function ZoneCreate() {
	return (
		<Pane header={[<ZoneCreateHeader />]}>
			<ZoneCreateBasicInfo />
		</Pane>
	);
}
