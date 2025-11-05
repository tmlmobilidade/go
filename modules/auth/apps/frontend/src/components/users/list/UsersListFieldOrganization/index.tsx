import { useOrganizationsContext } from '@/contexts/Organizations.context';
import { Tag } from '@tmlmobilidade/ui';

export function UsersListFieldOrganization({ organizationId }: { organizationId: string }) {
	//

	//
	// A. Setup variables

	const organizationsContext = useOrganizationsContext();

	//
	// B. Render components
	if (!organizationsContext.data.raw) return null;

	return <Tag label={organizationsContext.data.raw.find(organization => organization._id === organizationId)?.long_name} variant="secondary" />;
}
