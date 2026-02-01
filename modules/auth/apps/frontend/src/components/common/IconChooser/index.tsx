/* * */

import { iconMap } from '@/lib/icons';
import { Combobox } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

const iconData = Object.entries(iconMap).map(([key, icon]) => ({ icon, label: key, value: key }));

/* * */

interface IconChooserProps {
	selectedIcon?: string
	setSelectedIcon?: (icon: string) => void
}

/* * */
export function IconChooser({ selectedIcon, setSelectedIcon }: IconChooserProps) {
	//

	//
	// A. Setup Variables

	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleIconChange = (icon) => {
		setSelectedIcon(icon);
	};

	//
	//
	// C. Render components
	return (
		<Combobox
			data={iconData}
			label={t('default:common.IconChooser.label')}
			onChange={handleIconChange}
			value={iconData.find(item => item.value === selectedIcon)?.value}
			clearable
			fullWidth
		/>
	);

	//
}
