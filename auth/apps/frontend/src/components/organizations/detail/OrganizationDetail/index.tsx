'use client';

/* * */

import { Pane } from '@tmlmobilidade/ui';

import { OrganizationDetailHeader } from '../OrganizationDetailHeader';
import { OrganizationDetailBasicInfo } from '../OrganizationSectionBasicInfo';

/* * */

export function OrganizationDetail() {
	return (
		<Pane header={[<OrganizationDetailHeader />]}>
			<OrganizationDetailBasicInfo />
		</Pane>
	);
}
