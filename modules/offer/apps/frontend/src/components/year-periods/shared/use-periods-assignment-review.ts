'use client';

import { type YearPeriodsConflictsRequest, type YearPeriodsConflictsResponse } from '@tmlmobilidade/go-offer-pckg-types';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getPeriodsPermissions } from './periods-permissions';
import { usePeriodsAssignmentConflicts } from './use-periods-assignment-conflicts';

/* * */

export interface UsePeriodsAssignmentReviewReturnType {
	acknowledge: () => void
	acknowledged: boolean
	conflicts: YearPeriodsConflictsResponse['conflicts']
	error: null | string
	isChecking: boolean
	isReady: boolean
}

/* * */

/** Review is shared by calendar assignments and metadata edits that change operators. */
export function usePeriodsAssignmentReview({ request, userPermissions }: { request: null | YearPeriodsConflictsRequest, userPermissions?: Permission[] }): UsePeriodsAssignmentReviewReturnType {
	//

	//
	// A. Resolve conflicts and permissions for the current request

	const { t } = useTranslation();
	const { data, error: requestError, isLoading, queryKey } = usePeriodsAssignmentConflicts(request);
	const conflicts = useMemo(() => data?.conflicts ?? [], [data]);
	const blocked = conflicts.some((conflict) => {
		const permissions = getPeriodsPermissions({ currentAgencyIds: conflict.year_period.agency_ids, selectedAgencyIds: conflict.year_period.agency_ids, userPermissions });
		return conflict.year_period.is_locked || !permissions.update;
	});
	const error = requestError ?? (blocked ? t('default:periods.assignment.blockedConflict') : null);

	//
	// B. Bind confirmation to the current request and conflict snapshot

	// Returning to a previously selected request must require a fresh confirmation.
	const selection = useMemo(() => ({ queryKey }), [queryKey]);
	const [confirmation, setConfirmation] = useState<null | { selection: typeof selection, snapshot: string }>(null);
	const confirmationKey = data && queryKey ? JSON.stringify({ conflicts, queryKey }) : null;
	const acknowledged = !!confirmationKey && confirmation?.selection === selection && confirmation.snapshot === confirmationKey;
	const acknowledge = useCallback(() => {
		if (!error && !isLoading && confirmationKey) setConfirmation({ selection, snapshot: confirmationKey });
	}, [error, isLoading, confirmationKey, selection]);
	const isReady = !!data && !isLoading && !error && (!conflicts.length || acknowledged);

	//
	// C. Return review state

	return useMemo(() => ({ acknowledge, acknowledged, conflicts, error, isChecking: isLoading, isReady }), [acknowledge, acknowledged, conflicts, error, isLoading, isReady]);
}
