/* * */

import { Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface CurrencyTagProps {
	value: null | number | undefined
}

/* * */

export function CurrencyTag({ value }: CurrencyTagProps) {
	//

	//
	// A. Transform data

	const formattedCurrency = useMemo(() => {
		if (!value) return 'N/A';
		return new Intl.NumberFormat('pt-PT', { currency: 'EUR', style: 'currency' }).format(value / 100);
	}, [value]);

	const variantValue = useMemo(() => {
		if (!value) return 'secondary';
		if (value < 0) return 'danger';
		return 'success';
	}, [value]);

	//
	// B. Render components

	return <Tag label={formattedCurrency} variant={variantValue} filled />;

	//
}
