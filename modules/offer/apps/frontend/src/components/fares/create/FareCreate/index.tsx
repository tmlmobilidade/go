'use client';

import { FareCreateBasicInfo } from '@/components/fares/create/FareCreateBasicInfo';
import { FareCreateHeader } from '@/components/fares/create/FareCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function FareCreate() {
	return (
		<Pane header={[<FareCreateHeader />]}>
			<FareCreateBasicInfo />
		</Pane>
	);
}
