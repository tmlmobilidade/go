/* * */

import { useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
import { iconMap } from '@/lib/icons';
import { Combobox } from '@tmlmobilidade/ui';

/* * */

const iconData = Object.entries(iconMap).map(([key, icon]) => ({ icon, label: key, value: key }));

export function IconChooser() {
	const organizationContext = useOrganizationsDetailContext();
	return (
		<Combobox
			data={iconData}
			label="Ícones"
			fullWidth
			{...organizationContext.data.form.getInputProps('icon')}
		/>
	);
}
