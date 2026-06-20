'use client';

/* * */

import { CardDefault } from '@/components/CardDefault';
import { Grid } from '@/components/Grid';
import { IconCreditCardPay } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type DemandByAgencyByOperationalDate } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export function CcflDefault() {
	//

	//
	// A. Fetch data

	const { data: demandByAgencyByOperationalDateData, isLoading: demandByAgencyByOperationalDateLoading, isValidating: demandByAgencyByOperationalDateValidating } = useSWR<DemandByAgencyByOperationalDate[]>({ credentials: 'omit', url: API_ROUTES.hub.METRICS_DEMAND_BY_AGENCY_BY_OPERATIONAL_DATE });

	console.log(demandByAgencyByOperationalDateData);

	//
	// B. Transform data

	const ccflDemandToday = useMemo(() => {
		const todayOperationalDate = Dates.now('Europe/Lisbon').operational_date_int;
		const result = demandByAgencyByOperationalDateData?.find((item) => {
			const isToday = item.operational_date === todayOperationalDate;
			const isCCFL = item.agency_id === '1';
			return isToday && isCCFL;
		});
		if (!result) return '-';
		return Intl.NumberFormat('pt-PT', { style: 'decimal' }).format(result.qty);
	}, [demandByAgencyByOperationalDateData]);

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
					title="CCFL / Passageiros transportados hoje, até agora"
					valuePrimary={ccflDemandToday}
					valueSecondary={1}
				/>,
			]}
		/>
	);
}
