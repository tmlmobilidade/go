/* * */

import { useRolesContext } from '@/contexts/Roles.context';
import { useUsersListContext } from '@/contexts/UsersList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function UsersListFilterRole() {
	//

	//
	// A. Setup variables

	const rolesContext = useRolesContext();
	const usersListContext = useUsersListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all roles
		const defaultValues = rolesContext.data.raw.map(item => item._id);
		const enabledValues = usersListContext.filters.role_ids;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [usersListContext.filters.role_ids, rolesContext.data.raw]);

	const parsedOptions = useMemo(() => {
		// Skip if options are not provided or are empty.
		if (!rolesContext.data.raw?.length) return [];
		// Parse options to the expected format.
		return rolesContext.data.raw.map(item => ({
			checked: usersListContext.filters.role_ids.includes(item._id),
			label: item.name,
			value: item._id,
		}));
	}, [usersListContext.filters.role_ids, rolesContext.data.raw]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label="Grupos"
			onChange={usersListContext.actions.setFilterRoleIds}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
