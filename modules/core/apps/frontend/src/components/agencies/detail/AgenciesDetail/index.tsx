'use client';

import { AgenciesDetailAlertsMap } from '@/components/agencies/detail/AgenciesDetailAlertsMap';
import { AgenciesDetailApex } from '@/components/agencies/detail/AgenciesDetailApex';
import { AgenciesDetailBasicInfo } from '@/components/agencies/detail/AgenciesDetailBasicInfo';
import { AgenciesDetailContacts } from '@/components/agencies/detail/AgenciesDetailContacts';
import { AgenciesDetailFinancials } from '@/components/agencies/detail/AgenciesDetailFinancials';
import { AgenciesDetailHeader } from '@/components/agencies/detail/AgenciesDetailHeader';
import { AgenciesDetailOpenData } from '@/components/agencies/detail/AgenciesDetailOpenData';
import { Pane } from '@tmlmobilidade/ui';

import { useAgenciesDetailData } from '../use-agencies-detail-data';

/* * */

export function AgenciesDetail() {
	//

	const { isLoading } = useAgenciesDetailData();

	return (
		<Pane
			header={[<AgenciesDetailHeader key="header" />]}
			isLoading={isLoading}
		>
			<AgenciesDetailBasicInfo />
			<AgenciesDetailFinancials />
			<AgenciesDetailContacts />
			<AgenciesDetailOpenData />
			<AgenciesDetailApex />
			{/* <AgencySectionValidationRules /> */}
			<AgenciesDetailAlertsMap />
		</Pane>
	);
}
