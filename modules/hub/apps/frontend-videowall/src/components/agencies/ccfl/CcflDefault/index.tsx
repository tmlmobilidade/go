'use client';

/* * */

import { CardDefault } from '@/components/CardDefault';
import { Grid } from '@/components/Grid';
import { IconCreditCardPay } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import useSWR from 'swr';

/* * */

export function CcflDefault() {
	//

	//
	// A. Fetch data

	const { data: demandByAgencyByOperationalDateData, isLoading: demandByAgencyByOperationalDateLoading, isValidating: demandByAgencyByOperationalDateValidating } = useSWR({ credentials: 'omit', url: API_ROUTES.hub.METRICS_DEMAND_BY_AGENCY_BY_OPERATIONAL_DATE });

	console.log(demandByAgencyByOperationalDateData);

	//
	// C. Render components

	return (
		<Grid
			layout="primaryWithFourDetails"
			cells={[
				<CardDefault
					key="cm-passengers-today"
					icon={<IconCreditCardPay />}
					isLoading={demandByAgencyByOperationalDateLoading}
					isValidating={demandByAgencyByOperationalDateValidating}
					sentiment="good"
					title="CM / Passageiros transportados hoje, até agora"
					valuePrimary={1}
					valueSecondary={1}
				/>,
			]}
		/>
	);
}
