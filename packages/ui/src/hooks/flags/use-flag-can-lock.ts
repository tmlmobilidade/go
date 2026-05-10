'use client';

import { useMemo } from 'react';

/* * */

interface UseFlagCanLockProps {

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
	 * Indicates if the form has unsaved changes.
	 * This is a mandatory field.
	 */
	isDirty: boolean

	/**
	 * Indicates if the item is loading.
	 * If undefined, the item is considered not loading.
	 */
	isLoading?: boolean

	/**
	 * Indicates if the item is being locked.
	 * If undefined, the item is considered not currently locking.
	 */
	isLocking?: boolean

	/**
	 * Indicates if the form is valid.
	 * This is a mandatory field.
	 */
	isValid: boolean

}

interface UseFlagCanLockReturnType {

	/**
	 * Indicates if the item can be saved.
	 */
	canLock: boolean

}

/**
 * Hook to determine if an item should be in read-only mode
 * based on user permissions and item state.
 * @param props The properties to determine read-only status.
 * @returns An object containing the isCanLock flag.
 */
export function useFlagCanLock(props: UseFlagCanLockProps): UseFlagCanLockReturnType {
	//

	//
	// A. Handle actions

	const canLockValue = useMemo(() => {
		// If the user does not have an update permission,
		// then the item is read-only, regardless of other conditions.
		if (!props.hasPermission) return false;
		// If isDeleted is undefined, we consider it as not deleted.
		// Some document types do not have the isDeleted property.
		if (props.isDeleted !== undefined && props.isDeleted) return false;
		// If isDeleting is undefined, we consider it as not deleting.
		// Some document types do not have the isDeleting property.
		if (props.isDeleting !== undefined && props.isDeleting) return false;
		// If isLoading is undefined, we consider it as not loading.
		// Some document types do not have the isLoading property.
		if (props.isLoading !== undefined && props.isLoading) return false;
		// If isLocking is undefined, we consider it as not locking.
		// Some document types do not have the isLocking property.
		if (props.isLocking !== undefined && props.isLocking) return false;
		// If the form is dirty, we cannot save.
		if (props.isDirty) return false;
		// If the form is not valid, we cannot save.
		if (!props.isValid) return false;
		// Otherwise, locking is allowed.
		return true;
	}, [props]);

	//
	// B. Return value

	return { canLock: canLockValue };

	//
};
