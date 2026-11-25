'use client';

import { useCallback, useMemo, useState } from 'react';

import { getValidationsDetailResults, type ValidationsDetailResultsData, type ValidationsDetailResultSeverity } from './get-validations-detail-results';
import { useValidationsDetailContext } from './ValidationsDetailForm.context';

/* * */

export interface UseValidationsDetailResultsReturnType {
	actions: {
		toggleSeverity: (severity: ValidationsDetailResultSeverity) => void
	}
	data: ValidationsDetailResultsData
	filters: {
		severity: null | ValidationsDetailResultSeverity
	}
}

/* * */

export function useValidationsDetailResults(): UseValidationsDetailResultsReturnType {
	//

	//
	// A. Setup variables

	const { data: { validation } } = useValidationsDetailContext();
	const summary = validation?.summary;
	const [severity, setSeverity] = useState<null | ValidationsDetailResultSeverity>(null);

	//
	// B. Transform data

	const data = useMemo(() => getValidationsDetailResults(summary, severity), [summary, severity]);

	//
	// C. Handle actions

	const toggleSeverity = useCallback((value: ValidationsDetailResultSeverity) => {
		setSeverity(previous => previous === value ? null : value);
	}, []);

	//
	// D. Return state

	return useMemo(() => ({
		actions: { toggleSeverity },
		data,
		filters: { severity },
	}), [data, severity, toggleSeverity]);

	//
}
