/* * */

import { useUsersListContext } from '@/components/users/list/UsersList.context';
import { useOrganizationsContext } from '@/contexts/Organizations.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function UsersListFilterOrganization() {
	//

	//
	// A. Setup variables

	const organizationsContext = useOrganizationsContext();
	const usersListContext = useUsersListContext();

	const { t } = useTranslation();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = organizationsContext.data.raw.map(item => item._id);
		const enabledValues = usersListContext.filters.organization_ids;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [usersListContext.filters.organization_ids, organizationsContext.data.raw]);

	const parsedOptions = useMemo(() => {
		// Skip if options are not provided or are empty.
		if (!organizationsContext.data.raw?.length) return [];
		// Parse options to the expected format.
		return organizationsContext.data.raw.map(item => ({
			checked: usersListContext.filters.organization_ids.includes(item._id),
			label: item.long_name,
			value: item._id,
		}));
	}, [usersListContext.filters.organization_ids, organizationsContext.data.raw]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			label={t('default:users.list.FilterBar.organization.label')}
			onChange={usersListContext.actions.setFilterOrganizationIds}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
