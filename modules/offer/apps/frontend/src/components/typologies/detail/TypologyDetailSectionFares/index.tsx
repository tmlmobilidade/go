/* * */

import { useTypologyDetailContext } from '@/components/typologies/detail/TypologyDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Fare, FARE_PAYMENT_METHOD } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { Collapsible, fetchApiData, MultiSelect, Section, Select } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export function TypologyDetailSectionFares() {
	//

	//
	// A. Setup variables

	const typologyDetailContext = useTypologyDetailContext();
	const { data: faresData } = useSWR<ApiResponse<Fare[]>>(API_ROUTES.offer.FARES_LIST, {
		fetcher: async url => await fetchApiData<Fare[]>({ url }),
	});

	const prepaidFaresOptions = useMemo(() => {
		return faresData?.data?.filter(f => f.payment_method === FARE_PAYMENT_METHOD.PREPAID).map(fare => ({
			label: fare.name,
			value: fare._id,
		})) ?? [];
	}, [faresData?.data]);

	const onboardFaresOptions = useMemo(() => {
		return faresData?.data?.filter(f => f.payment_method === FARE_PAYMENT_METHOD.ONBOARD).map(fare => ({
			label: fare.name,
			value: fare._id,
		})) ?? [];
	}, [faresData]);

	//
	// B. Render components

	return (
		<Collapsible title="Tarifas associadas">
			<Section gap="md">
				<Select
					key={typologyDetailContext.data.form.key('default_prepaid_fare_id')}
					data={prepaidFaresOptions}
					description="navegante® pré-pago"
					disabled={typologyDetailContext.flags.isReadOnly}
					label="Tarifa Pré-paga por defeito"
					w="100%"
					{...typologyDetailContext.data.form.getInputProps('default_prepaid_fare_id')}
				/>

				<MultiSelect
					key={typologyDetailContext.data.form.key('default_onboard_fare_ids')}
					data={onboardFaresOptions}
					description="navegante® a bordo"
					disabled={typologyDetailContext.flags.isReadOnly}
					label="Tarifa de Bordo por defeito"
					w="100%"
					{...typologyDetailContext.data.form.getInputProps('default_onboard_fare_ids')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
