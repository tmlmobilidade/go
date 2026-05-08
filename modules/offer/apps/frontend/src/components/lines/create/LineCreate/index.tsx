'use client';

import { LineCreateBasicInfo } from '@/components/lines/create/LineCreateBasicInfo';
import { LineCreateHeader } from '@/components/lines/create/LineCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function LineCreate() {
	return (
		<Pane header={[<LineCreateHeader />]}>
			<LineCreateBasicInfo />
		</Pane>
	);
}
