'use client';

import { TypologyCreateBasicInfo } from '@/components/typologies/create/TypologyCreateBasicInfo';
import { TypologyCreateHeader } from '@/components/typologies/create/TypologyCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function TypologyCreate() {
	return (
		<Pane header={[<TypologyCreateHeader />]}>
			<TypologyCreateBasicInfo />
		</Pane>
	);
}
