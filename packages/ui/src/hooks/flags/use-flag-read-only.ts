'use client';

import { useMemo } from 'react';

/* * */

interface UseFlagReadOnlyProps {

	/**
	 * Indicates if the user has permission to update the item.
	 * If multiple permissions are required, this should be the combined result.
	 * This is a mandatory field.
	 */
	hasPermission: boolean

	/**
	 * Indicates if the item is deleted.
	 * If undefined, the item is considered not deleted.
	 */
	isDeleted?: boolean

	/**
	 * Indicates if the item is being deleted.
	 * If undefined, the item is considered not currently deleting.
	 */
	isDeleting?: boolean

	/**
	 * Indicates if the item is loading.
	 * If undefined, the item is considered not loading.
	 */
	isLoading?: boolean

	/**
	 * Indicates if the item is locked.
	 * If undefined, the item is considered not locked.
	 */
	isLocked?: boolean

	/**
	 * Indicates if the item is being locked.
	 * If undefined, the item is considered not currently locking.
	 */
	isLocking?: boolean

	/**
	 * Indicates if the item is being saved.
	 * If undefined, the item is considered not currently saving.
	 */
	isSaving?: boolean

}

interface UseFlagReadOnlyReturnType {

	/**
	 * Indicates if the item is in read-only mode.
	 */
	isReadOnly: boolean

}

/**
 * Hook to determine if an item should be in read-only mode
 * based on user permissions and item state.
 * @param props The properties to determine read-only status.
 * @returns An object containing the isReadOnly flag.
 */
export function useFlagReadOnly(props: UseFlagReadOnlyProps): UseFlagReadOnlyReturnType {
	//

	//
	// A. Handle actions

	const isReadOnlyValue = useMemo(() => {
		// If the user does not have an update permission,
		// then the item is read-only, regardless of other conditions.
		if (!props.hasPermission) return true;
		// If isDeleted is undefined, we consider it as not deleted.
		// Some document types do not have the isDeleted property.
		if (props.isDeleted !== undefined && props.isDeleted) return true;
		// If isDeleting is undefined, we consider it as not deleting.
		// Some document types do not have the isDeleting property.
		if (props.isDeleting !== undefined && props.isDeleting) return true;
		// If isLoading is undefined, we consider it as not loading.
		// Some document types do not have the isLoading property.
		if (props.isLoading !== undefined && props.isLoading) return true;
		// If isLocked is undefined, we consider it as not locked.
		// Some document types may not have the isLocked property.
		if (props.isLocked !== undefined && props.isLocked) return true;
		// If isLocking is undefined, we consider it as not locking.
		// Some document types do not have the isLocking property.
		if (props.isLocking !== undefined && props.isLocking) return true;
		// If isSaving is undefined, we consider it as not saving.
		// Some document types do not have the isSaving property.
		if (props.isSaving !== undefined && props.isSaving) return true;
		// If the user has permission and the item is not locked,
		// then the item is not read-only.
		return false;
	}, [props]);
	//
	// B. Return value

	return { isReadOnly: isReadOnlyValue };

	//
};
