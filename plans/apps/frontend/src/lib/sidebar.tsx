import { IconFileCertificate, IconFileCheck } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { SidebarSubItemProps } from '@tmlmobilidade/ui';

export const submenuItems: SidebarSubItemProps[] = [
	{
		_id: 'plans-plans',
		href: '/plans',
		icon: <IconFileCertificate />,
		label: 'Planos',
		permission: { action: Permissions.plans.actions.list, scope: Permissions.plans.scope },
	},
	{
		_id: 'plans-validation',
		href: '/validations',
		icon: <IconFileCheck />,
		label: 'Validações',
		permission: { action: Permissions.validations.actions.list, scope: Permissions.validations.scope },
	},
];
