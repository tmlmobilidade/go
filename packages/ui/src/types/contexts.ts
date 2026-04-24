/* * */

import { UseFilterStateStringReturnType } from '../hooks/use-filter-state-string';

/**
 * Use this interface to type the state of **List** contexts.
 * It provides a `filters` section with a single search filter,
 * that should be expanded with other filters as needed.
 * A `flags` section with error and loading flags is also provided.
 * You should add a `data: { ... }` section and expand these defaults as needed.
 */
export interface ListContextStateTemplate {
	filters: {
		search: UseFilterStateStringReturnType
	}
	flags: {
		error: Error | undefined
		isLoading: boolean
	}
}

/**
 * Use this interface to type the state of **Create** contexts.
 * It provides an `actions` section, with a create method
 * and a `flags` section, with error and loading flags.
 * You should add a `data: { ... }` section and expand these defaults as needed.
 */
export interface CreateContextStateTemplate {
	actions: {
		create: () => void
	}
	flags: {
		canCreate?: boolean
		error: Error | undefined
		isCreating?: boolean
		isLoading: boolean
	}
}

/**
 * Use this interface to type the state of **Detail** contexts.
 * It provides an `actions` section, with a save, lock and delete method
 * and a `flags` section, with error, isSaving and loading flags.
 * You should add a `data: { ... }` section and expand these defaults as needed.
 */
export interface DetailContextStateTemplate {
	actions: {
		delete?: () => void
		lock?: () => void
		save: () => void
	}
	flags: {
		canDelete?: boolean
		canDuplicate?: boolean
		canLock?: boolean
		canSave?: boolean
		error: Error | undefined
		isDeleting?: boolean
		isLoading: boolean
		isLocking?: boolean
		isReadOnly?: boolean
		isSaving?: boolean
	}
}
