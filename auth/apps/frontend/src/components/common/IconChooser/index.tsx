/* * */

import { iconMap } from '@/lib/icons';
import { Combobox } from '@tmlmobilidade/ui';

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
	// A. Setup variables

	//
	// B. Handle actions

	const handleIconChange = (icon) => {
		console.log(icon);
		setSelectedIcon(icon);
	};

	//
	//
	// C. Render components
	return (
		<Combobox
			data={iconData}
			label="Ícones"
			onChange={handleIconChange}
			value={iconData.find(item => item.value === selectedIcon)?.value}
			fullWidth
		/>
	);

	//
}
