'use client';

import { AgenciesDetailAlertsMap } from '@/components/agencies/detail/AgenciesDetailAlertsMap';
import { AgenciesDetailApex } from '@/components/agencies/detail/AgenciesDetailApex';
import { AgenciesDetailBasicInfo } from '@/components/agencies/detail/AgenciesDetailBasicInfo';
import { AgenciesDetailContacts } from '@/components/agencies/detail/AgenciesDetailContacts';
import { AgenciesDetailFinancials } from '@/components/agencies/detail/AgenciesDetailFinancials';
import { AgenciesDetailHeader } from '@/components/agencies/detail/AgenciesDetailHeader';
import { AgenciesDetailOpenData } from '@/components/agencies/detail/AgenciesDetailOpenData';
import { AgencySectionValidationRules } from '@/components/agencies/detail/AgencySectionValidationRules';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function AgenciesDetail() {
	return (
		<Pane header={[<AgenciesDetailHeader key="header" />]}>
			<AgenciesDetailBasicInfo />
			<AgenciesDetailFinancials />
			<AgenciesDetailContacts />
			<AgenciesDetailOpenData />
			<AgenciesDetailApex />
			<AgencySectionValidationRules />
			<AgenciesDetailAlertsMap />
		</Pane>
	);
}
