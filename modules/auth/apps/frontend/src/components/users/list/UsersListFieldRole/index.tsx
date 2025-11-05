import { useRolesContext } from '@/contexts/Roles.context';
import { Tag } from '@tmlmobilidade/ui';

export function UsersListFieldRole({ role_id }: { role_id: string }) {
	//

	//
	// A. Setup variables

	const rolesListContext = useRolesContext();

	//
	// B. Render components

	return <Tag label={rolesListContext.data.raw.find(role => role._id === role_id)?.name} variant="secondary" />;
}
