/* * */

import { Image } from '@mantine/core';

import styles from './styles.module.css';

/* * */

interface AlertsListItemImageThumbnailProps {
	alt: string
	src: string
}

/* * */

export default function Component({ alt, src }: AlertsListItemImageThumbnailProps) {
	//

	//
	// C. Render components

	return (
		<Image
			alt={alt}
			className={styles.image}
			fallbackSrc={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/assets/common/placeholder.png`}
			src={src}
		/>
	);
}
