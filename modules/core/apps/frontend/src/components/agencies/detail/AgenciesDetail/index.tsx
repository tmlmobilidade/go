'use client';

import { AgenciesDetailHeader } from '@/components/agencies/detail/AgenciesDetailHeader';
import { AgencySectionAlertsMap } from '@/components/agencies/detail/AgencySectionAlertsMap';
import { AgencySectionApex } from '@/components/agencies/detail/AgencySectionApex';
import { AgencyDetailBasicInfo } from '@/components/agencies/detail/AgencySectionBasicInfo';
import { AgencySectionContacts } from '@/components/agencies/detail/AgencySectionContacts';
import { AgencySectionFinancials } from '@/components/agencies/detail/AgencySectionFinancials';
import { AgencySectionOpenData } from '@/components/agencies/detail/AgencySectionOpenData';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function AgenciesDetail() {
	return (
		<Pane header={[<AgenciesDetailHeader key="header" />]}>
			<AgencyDetailBasicInfo />
			<AgencySectionFinancials />
			<AgencySectionContacts />
			<AgencySectionOpenData />
			<AgencySectionApex />
			{/* <AgencySectionValidationRules /> */}
			<AgencySectionAlertsMap />
		</Pane>
	);
}
