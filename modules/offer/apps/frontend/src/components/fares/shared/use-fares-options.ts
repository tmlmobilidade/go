'use client';

import { FARE_CURRENCY, FARE_PAYMENT_METHOD, FARE_TRANSFERS } from '@tmlmobilidade/go-types-offer';
import { type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface UseFaresOptionsReturnType {
	currencyOptions: SelectDataItem[]
	paymentMethodOptions: SelectDataItem[]
	transferOptions: SelectDataItem[]
}

/* * */

export function useFaresOptions(): UseFaresOptionsReturnType {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Return data

	return useMemo(() => ({
		currencyOptions: [{ label: t('default:fares.options.currency.eur'), value: FARE_CURRENCY.EUR }],
		paymentMethodOptions: [
			{ label: t('default:fares.options.paymentMethod.onboard'), value: FARE_PAYMENT_METHOD.ONBOARD },
			{ label: t('default:fares.options.paymentMethod.prepaid'), value: FARE_PAYMENT_METHOD.PREPAID },
		],
		transferOptions: [
			{ label: t('default:fares.options.transfers.none'), value: FARE_TRANSFERS.NONE },
			{ label: t('default:fares.options.transfers.one'), value: FARE_TRANSFERS.ONE },
			{ label: t('default:fares.options.transfers.two'), value: FARE_TRANSFERS.TWO },
			{ label: t('default:fares.options.transfers.unlimited'), value: FARE_TRANSFERS.UNLIMITED },
		],
	}), [t]);
}
