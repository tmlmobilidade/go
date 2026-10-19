'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseAlertsDetailAlertIdReturnType {
	alertId: string
}

/* * */

export function useAlertsDetailAlertId(): UseAlertsDetailAlertIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ alertId: string }>();

	const alertId = decodeURIComponent(params.alertId);

	//
	// B. Return data

	return useMemo(() => ({
		alertId,
	}), [alertId]);
}
