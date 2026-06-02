/* * */

import { IconsConnections, IconsFacilities } from '@/settings/assets.settings';
import { Image, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	category: 'connections' | 'facilities'
	name: string
}

/* * */

export function IconDisplay({ category, name }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	let iconSrc: string;

	switch (category) {
		case 'connections':
			iconSrc = IconsConnections[name as keyof typeof IconsConnections];
			break;
		case 'facilities':
			iconSrc = IconsFacilities[name as keyof typeof IconsFacilities];
			break;
	}

	//
	// C. Render components

	if (!iconSrc) {
		return null;
	}

	const label = category === 'connections' ? t(`default:common.IconDisplay.connections.${name as keyof typeof IconsConnections}`) : t(`default:common.IconDisplay.facilities.${name as keyof typeof IconsFacilities}`);

	return (
		<div className={styles.container}>
			<Tooltip
				events={{ focus: true, hover: true, touch: true }}
				label={label}
				withArrow
			>
				<Image alt={label} src={iconSrc} />
			</Tooltip>
		</div>
	);

	//
}
