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

export function CmDefault() {
	//

	//
	// A. Fetch data

	const { data: demandByAgencyByOperationalDateData, isLoading: demandByAgencyByOperationalDateLoading, isValidating: demandByAgencyByOperationalDateValidating } = useSWR<DemandByAgencyByOperationalDate[]>({ credentials: 'omit', url: API_ROUTES.hub.METRICS_DEMAND_BY_AGENCY_BY_OPERATIONAL_DATE });

	//
	// B. Transform data

	const cmDemandToday = useMemo(() => {
		const todayOperationalDate = Dates.now('Europe/Lisbon').operational_date_int;
		const result = demandByAgencyByOperationalDateData?.filter((item) => {
			const isToday = item.operational_date === todayOperationalDate;
			const isCM = item.agency_id === '41' || item.agency_id === '42' || item.agency_id === '43' || item.agency_id === '44';
			return isToday && isCM;
		}).reduce((acc, item) => acc + item.qty, 0);
		return result ?? -1;
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
					title="CM / Passageiros transportados hoje, até agora"
					valuePrimary={Intl.NumberFormat('pt-PT', { style: 'decimal' }).format(cmDemandToday)}
					valueSecondary={1}
				/>,
			]}
		/>
	);
}
