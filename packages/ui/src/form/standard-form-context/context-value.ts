/* * */

import { type UseStandardFormReturnType } from '../standard-form/use-standard-form';
import { type UseStandardFormCapabilitiesReturnType } from './use-standard-form-capabilities';

/**
 * Use this interface to type the state of **StandardFormContext** contexts.
 * It extends the `UseStandardFormReturnType` interface and adds an `actions` section,
 * with a save, lock and delete method and a `capabilities` section, with capabilities for delete, duplicate, lock and save.
 */
export interface StandardFormContextValue<T> extends UseStandardFormReturnType<T> {

	/**
	 * The actions to perform on the form.
	 */
	actions: {
		create?: () => void
		delete?: () => void
		duplicate?: () => void
		lock?: () => void
		update?: () => void
	}

	/**
	 * The capabilities to determine if the actions are enabled.
	 */
	capabilities?: Partial<UseStandardFormCapabilitiesReturnType>

	/**
	 * The status of the form.
	 */
	status: {
		isCreating?: boolean
		isDeleting?: boolean
		isDuplicating?: boolean
		isLoading?: boolean
		isLocked?: boolean
		isLocking?: boolean
		isUpdating?: boolean
		isValidating?: boolean
	}

}
