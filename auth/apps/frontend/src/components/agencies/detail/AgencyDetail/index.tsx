'use client';

/* * */

import { Pane } from '@tmlmobilidade/ui';

import { AgencyDetailHeader } from '../AgencyDetailHeader';
import { AgencyDetailBasicInfo } from '../AgencySectionBasicInfo';
import { AgencySectionContacts } from '../AgencySectionContacts';
import { AgencySectionFinacial } from '../AgencySectionFinacial';

/* * */

export function AgencyDetail() {
	return (
		<Pane header={[<AgencyDetailHeader />]}>
			<AgencyDetailBasicInfo />
			<AgencySectionFinacial />
			<AgencySectionContacts />
		</Pane>
	);
}
