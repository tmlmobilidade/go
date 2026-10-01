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

export function CmDefault() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Fetch data

	const { data: demandByAgencyByOperationalDateData, isLoading: demandByAgencyByOperationalDateLoading, isValidating: demandByAgencyByOperationalDateValidating } = useAgenciesDemandData();

	//
	// C. Transform data

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
	// D. Render components

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
					title={t('default:agencies.CmDefault.title')}
					valuePrimary={Intl.NumberFormat('pt-PT', { style: 'decimal' }).format(cmDemandToday)}
					valueSecondary={1}
				/>,
			]}
		/>
	);

	//
}
