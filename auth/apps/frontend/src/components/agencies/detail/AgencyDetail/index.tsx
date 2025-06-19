'use client';

/* * */

import { Pane } from '@tmlmobilidade/ui';

import { AgencyDetailHeader } from '../AgencyDetailHeader';
import { AgencyDetailBasicInfo } from '../AgencySectionBasicInfo';
import { AgencySectionFinacial } from '../AgencySectionFinacial';

/* * */

export function AgencyDetail() {
	return (
		<Pane header={[<AgencyDetailHeader />]}>
			<AgencyDetailBasicInfo />
			<AgencySectionFinacial />
		</Pane>
	);
}
