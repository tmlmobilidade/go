/* * */

import { type UseStandardFormReturnType } from '../standard-form/use-standard-form';
import { type UseStandardFormFlagsReturnType } from './use-standard-form-flags';

/**
 * Use this interface to type the state of **Form** contexts.
 * It extends the `UseStandardFormReturnType` interface and adds an `actions` section,
 * with a save, lock and delete method and a `flags` section, with flags for delete, duplicate, lock and save.
 */
export interface StandardFormContextValue<T> {

	/**
	 * The actions to perform on the form.
	 */
	actions: {
		delete?: () => void
		duplicate?: () => void
		lock?: () => void
		save: () => void
	}

	/**
	 * The flags to determine if the actions are enabled and the form is valid.
	 */
	flags: Partial<UseStandardFormFlagsReturnType>

	/**
	 * The form instance.
	 */
	form: UseStandardFormReturnType<T>

}
