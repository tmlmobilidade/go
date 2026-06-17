'use client';

import { Dates } from '@tmlmobilidade/dates';
import { UnixTimestamp } from '@tmlmobilidade/types';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useMemo } from 'react';

/* * */

export interface UseFilterStateDateReturnType {

	/**
	 * Indicates if the filter is currently active.
	 */
	isActive: boolean

	/**
	 * Function to set the filter value.
	 * @param value The new value for the filter.
	 */
	set: (value: null | number) => void

	/**
	 * The current value of the filter.
	 */
	value: number | UnixTimestamp

}

/**
 * Hook para gerir estados de data (Unix Timestamps) com sincronização no URL.
 * @param key A chave que vai aparecer na query string do URL (ex: 'date_start')
 * @param defaults O valor numérico padrão caso não exista nada no URL
 * @returns The filter state management object.
 */
export function useFilterStateDate(key: string, defaults: number): UseFilterStateDateReturnType {
	//

	//
	// A. Setup variables

	const [urlValue, setUrlValue] = useQueryState(
		key,
		parseAsInteger.withDefault(defaults),
	);

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The filter is not active
		// if the URL value is not set
		if (!urlValue) return false;
		// The filter is active if
		// the values are different.
		return urlValue !== defaults;
	}, [urlValue, defaults]);

	//
	// D. Return data

	return {
		isActive,
		set: setUrlValue,
		value: urlValue,
	};

	//
}
