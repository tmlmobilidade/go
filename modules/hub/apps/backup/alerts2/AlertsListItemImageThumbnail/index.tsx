/* * */

import { Image } from '@mantine/core';
import { IconCircleArrowUpRightFilled } from '@tabler/icons-react';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

interface AlertsListItemImageThumbnailProps {
	alertId: string
	alertTitle: string
	alt: string
	href: string
	src: string
	target?: string
}

/* * */

export default function Component({ alt, href, src, target }: AlertsListItemImageThumbnailProps) {
	//

	//
	// C. Render components

	return (
		<Link className={styles.container} href={href} target={target}>
			<IconCircleArrowUpRightFilled className={styles.icon} size={25} />
			<Image
				alt={alt}
				className={styles.image}
				fallbackSrc={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/assets/common/placeholder.png`}
				src={src}
			/>
		</Link>
	);
}
