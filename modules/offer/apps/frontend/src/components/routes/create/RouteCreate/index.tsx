'use client';

import { RouteCreateBasicInfo } from '@/components/routes/create/RouteCreateBasicInfo';
import { RouteCreateHeader } from '@/components/routes/create/RouteCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function RouteCreate() {
	return (
		<Pane header={[<RouteCreateHeader />]}>
			<RouteCreateBasicInfo />
		</Pane>
	);
}
