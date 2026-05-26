'use client';

import { useMeContext } from '../../../contexts/Me.context';

/* * */

interface HasPermissionProps {
	action: string
	children: React.ReactNode
	fallback?: React.ReactNode
	scope: string
}

interface ResourceKeyAndValue {
	resourceKey: string
	value: string | string[]
}

interface NoResourceKeyOrValue {
	resourceKey?: never
	value?: never
}

type HasPermissionFinalProps = HasPermissionProps & (NoResourceKeyOrValue | ResourceKeyAndValue);

/* * */

export function HasPermission({ action, children, fallback, resourceKey, scope, value }: HasPermissionFinalProps) {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	//
	// B. Render components

	if (!resourceKey && !value && meContext.actions.hasPermission(scope, action)) {
		return <>{children}</>;
	}

	// Handle single value
	if (typeof value === 'string') {
		if (meContext.actions.hasPermissionResource({ action, resource_key: resourceKey, scope, value: value ?? '' })) {
			return <>{children}</>;
		}
	}

	// Handle array of values - user must have permission for at least one
	if (Array.isArray(value)) {
		// If array is empty, allow access (applies to all)
		if (value.length === 0) {
			return <>{children}</>;
		}

		// Check if user has permission for at least one value
		const hasAnyPermission = value.some(val =>
			meContext.actions.hasPermissionResource({ action, resource_key: resourceKey, scope, value: val }),
		);

		if (hasAnyPermission) {
			return <>{children}</>;
		}
	}

	return fallback ?? null;

	//
}
