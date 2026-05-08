'use client';

import { PatternCreateBasicInfo } from '@/components/patterns/create/PatternCreateBasicInfo';
import { PatternCreateHeader } from '@/components/patterns/create/PatternCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function PatternCreate() {
	return (
		<Pane header={[<PatternCreateHeader />]}>
			<PatternCreateBasicInfo />
		</Pane>
	);
}
