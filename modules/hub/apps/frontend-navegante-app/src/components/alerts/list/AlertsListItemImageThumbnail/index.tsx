/* * */

import { Image } from '@mantine/core';

import styles from './styles.module.css';

/* * */

interface AlertsListItemImageThumbnailProps {
	alt: string
	src: string
}

/* * */

export function AlertsListItemImageThumbnail({ alt, src }: AlertsListItemImageThumbnailProps) {
	//

	//
	// C. Render components

	return (
		<Image
			alt={alt}
			className={styles.image}
			src={src}
		/>
	);
}
