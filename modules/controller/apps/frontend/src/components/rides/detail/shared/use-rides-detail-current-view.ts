'use client';

import { useSessionStorage } from '@mantine/hooks';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export const RidesDetailCurrentViewValues = [
	'acceptance',
	'analysis',
	'audit',
] as const;

type RidesDetailCurrentView = (typeof RidesDetailCurrentViewValues)[number];

/* * */

const currentViewPermissionsMap: Record<RidesDetailCurrentView, string> = {
	acceptance: PermissionCatalog.all.rides.actions.acceptance_read,
	analysis: PermissionCatalog.all.rides.actions.analysis_read,
	audit: PermissionCatalog.all.rides.actions.audit_read,
};

/* * */

interface UseRidesDetailCurrentViewReturnType {
	availableViews: RidesDetailCurrentView[]
	currentView: RidesDetailCurrentView
	setCurrentView: (view: RidesDetailCurrentView) => void
}

/* * */

export function useRidesDetailCurrentView(): UseRidesDetailCurrentViewReturnType {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const [currentView, setCurrentView] = useSessionStorage<RidesDetailCurrentView>({
		defaultValue: 'analysis',
		key: 'rides-detail-current-view',
	});

	const availableViews = useMemo(() => {
		return RidesDetailCurrentViewValues.filter((item) => {
			return meContext.actions.hasPermission(PermissionCatalog.all.rides.scope, currentViewPermissionsMap[item]);
		});
	}, [meContext.data.user.permissions]);

	//
	// B. Return data

	return useMemo(() => ({
		availableViews,
		currentView,
		setCurrentView,
	}), [currentView, setCurrentView, availableViews]);
}
