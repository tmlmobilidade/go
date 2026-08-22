'use client';

import { useMemo } from 'react';

/* * */

interface UseStandardFormCapabilitiesProps {

	/**
	 * The properties to determine if the item can be deleted.
	 * @property deletePermission The permission to delete the item.
	 * @property isDeleted The state of the item.
	 * @property isDeleting The state of the item being deleted.
	 */
	delete?: {
		hasPermission?: boolean
		isDeleted?: boolean
		isDeleting?: boolean
	}

	/**
	 * The properties to determine if the item can be duplicated.
	 * @property duplicatePermission The permission to duplicate the item.
	 * @property isDuplicating The state of the item being duplicated.
	 */
	duplicate?: {
		hasPermission?: boolean
		isDuplicating?: boolean
	}

	/**
	 * The properties to determine if the form is dirty and valid.
	 * @property isDirty Indicates if the form has unupdated changes.
	 * @property isValid Indicates if the form is valid.
	 */
	form: {
		isDirty: boolean
		isValid: boolean
	}

	/**
	 * The properties to determine if the item is loading and validating.
	 * @property isLoading Indicates if the item is loading.
	 * @property isValidating Indicates if the item is validating.
	 * @default false
	 */
	loading?: {
		isLoading?: boolean
		isValidating?: boolean
	}

	/**
	 * The properties to determine if the item is locked and locking.
	 * @property isLocked Indicates if the item is locked.
	 * @property isLocking Indicates if the item is locking.
	 * @property lockPermission The permission to lock the item.
	 */
	locked?: {
		hasPermission?: boolean
		isLocked?: boolean
		isLocking?: boolean
	}

	/**
	 * The properties to determine if the item is updating and updating.
	 * @property isUpdating Indicates if the item is updating.
	 * @property isUpdatingPermission The permission to update the item.
	 */
	update?: {
		hasPermission?: boolean
		isUpdating?: boolean
	}

}

export interface UseStandardFormCapabilitiesReturnType {

	/**
	 * Indicates if the item can be deleted.
	 */
	deleteEnabled: boolean

	/**
	 * Indicates if the item can be duplicated.
	 */
	duplicateEnabled: boolean

	/**
	 * Indicates if the item can be edited.
	 */
	editEnabled: boolean

	/**
	 * Indicates if the item can be locked.
	 */
	lockEnabled: boolean

	/**
	 * Indicates if the item can be updated.
	 */
	updateEnabled: boolean

}

/**
 * Hook to determine if an item should be in read-only mode
 * based on user permissions and item state.
 * @param props The properties to determine read-only status.
 * @returns An object containing the form flags.
 */
export function useStandardFormCapabilities(props: UseStandardFormCapabilitiesProps): UseStandardFormCapabilitiesReturnType {
	//

	const deleteEnabled = (() => {
		if (!props.delete?.hasPermission) return false;
		if (props.loading?.isLoading) return false;
		if (props.locked?.isLocked) return false;
		if (props.form.isDirty) return false;
		if (!props.form.isValid) return false;
		return true;
	})();

	const updateEnabled = ((): boolean => {
		if (!props.update?.hasPermission) return false;
		if (props.loading?.isLoading) return false;
		if (props.locked?.isLocked) return false;
		if (!props.form.isDirty) return false;
		if (!props.form.isValid) return false;
		return true;
	})();

	// console.log('updateEnabled', updateEnabled, props);

	const duplicateEnabled = ((): boolean => {
		if (!props.duplicate?.hasPermission) return false;
		if (props.loading?.isLoading) return false;
		if (props.locked?.isLocked) return false;
		if (props.form.isDirty) return false;
		if (!props.form.isValid) return false;
		return true;
	})();

	const lockEnabled = ((): boolean => {
		if (!props.locked?.hasPermission) return false;
		if (props.loading?.isLoading) return false;
		if (props.locked?.isLocking) return false;
		if (props.form.isDirty) return false;
		if (!props.form.isValid) return false;
		return true;
	})();

	const editEnabled = ((): boolean => {
		if (!props.update?.hasPermission) return true;
		if (props.delete?.isDeleted) return false;
		if (props.loading?.isLoading) return true;
		if (props.locked?.isLocked) return true;
		if (props.form.isDirty) return true;
		if (!props.form.isValid) return true;
		return false;
	})();

	return useMemo(() => ({
		deleteEnabled,
		duplicateEnabled,
		editEnabled,
		lockEnabled,
		updateEnabled,
	}), [deleteEnabled, duplicateEnabled, editEnabled, lockEnabled, updateEnabled]);
};
