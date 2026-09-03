'use client';

import { AgenciesDetailAlerts } from '@/components/agencies/detail/AgenciesDetailAlerts';
import { AgenciesDetailBasicInfo } from '@/components/agencies/detail/AgenciesDetailBasicInfo';
import { AgenciesDetailFinancials } from '@/components/agencies/detail/AgenciesDetailFinancials';
import { AgenciesDetailHeader } from '@/components/agencies/detail/AgenciesDetailHeader';
import { AgenciesDetailOpenData } from '@/components/agencies/detail/AgenciesDetailOpenData';
import { AgenciesDetailPlans } from '@/components/agencies/detail/AgenciesDetailPlans';
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
			<AgenciesDetailOpenData />
			<AgenciesDetailPlans />
			<AgenciesDetailAlerts />
		</Pane>
	);
}
