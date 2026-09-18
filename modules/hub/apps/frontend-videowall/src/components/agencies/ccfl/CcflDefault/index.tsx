'use client';

/* * */

import { useAgenciesDemandData } from '@/components/agencies/shared/use-agencies-demand-data';
import { CardDefault } from '@/components/CardDefault';
import { Grid } from '@/components/Grid';
import { IconCreditCardPay } from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function CcflDefault() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Fetch data

	const { data: demandByAgencyByOperationalDateData, isLoading: demandByAgencyByOperationalDateLoading, isValidating: demandByAgencyByOperationalDateValidating } = useAgenciesDemandData();

	//
	// C. Transform data

	const ccflDemandToday = useMemo(() => {
		const todayOperationalDate = Dates.now('Europe/Lisbon').operational_date_int;
		const result = demandByAgencyByOperationalDateData?.find((item) => {
			const isToday = item.operational_date === todayOperationalDate;
			const isCCFL = item.agency_id === '1';
			return isToday && isCCFL;
		});
		if (!result) return -1;
		return result.qty;
	}, [demandByAgencyByOperationalDateData]);

	//
	// D. Render components

	return (
		<Grid
			layout="primaryWithFourDetails"
			cells={[
				<CardDefault
					key="ccfl-passengers-today"
					icon={<IconCreditCardPay />}
					isLoading={demandByAgencyByOperationalDateLoading}
					isValidating={demandByAgencyByOperationalDateValidating}
					sentiment="good"
					title={t('default:agencies.CcflDefault.title')}
					valuePrimary={Intl.NumberFormat('pt-PT', { style: 'decimal' }).format(ccflDemandToday)}
					valueSecondary={1}
				/>,
			]}
		/>
	);

	//
}
