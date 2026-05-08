/* * */

import { type UseFormReturn } from 'react-hook-form';

import { type UseFilterStateStringReturnType } from '../hooks/use-filter-state-string';

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
		isValidating?: boolean
	}
}

/**
 * Use this interface to type the state of **Create** contexts.
 * It provides an `actions` section, with a create method
 * and a `flags` section, with error and loading flags.
 * You should add a `data: { ... }` and `form: { ... }` sections
 * and expand these defaults as needed.
 */
export interface CreateContextStateTemplate<T = any> {
	actions: {
		create: () => void
	}
	flags: {
		canCreate?: boolean
		error: Error | undefined
		isCreating?: boolean
		isLoading: boolean
	}
	form?: {
		instance: UseFormReturn<T>
	}
}

/**
 * Use this interface to type the state of **Detail** contexts.
 * It provides an `actions` section, with a save, lock and delete method
 * and a `flags` section, with error, isSaving and loading flags.
 * You should add a `data: { ... }` section and expand these defaults as needed.
 */
export interface DetailContextStateTemplate<T = any> {
	actions: {
		delete?: () => void
		duplicate?: () => void
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
		isDuplicating?: boolean
		isLoading: boolean
		isLocking?: boolean
		isReadOnly?: boolean
		isSaving?: boolean
		isValidating?: boolean
	}
	form?: {
		instance: UseFormReturn<T>
	}
}
