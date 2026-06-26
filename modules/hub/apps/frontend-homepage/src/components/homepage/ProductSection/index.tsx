/* * */

import { PlaceholderMedia } from '@/components/homepage/PlaceholderMedia';
import { type HomepageProduct } from '@/content/homepage';
import { IconPlayerPlay } from '@tabler/icons-react';
import { Button } from '@tmlmobilidade/ui';
import clsx from 'clsx';

import styles from './styles.module.css';

/* * */

interface ProductSectionProps {
	product: HomepageProduct
	variant: 'inverted' | 'regular'
}

/* * */

export function ProductSection({ product, variant }: ProductSectionProps) {
	return (
		<article className={clsx(styles.container, variant === 'inverted' && styles.inverted)}>
			<div className={styles.copy}>
				<span className={styles.eyebrow}>{product.eyebrow}</span>
				<h3>{product.title}</h3>
				<p>{product.description}</p>
				<div className={styles.cta} inert>
					<Button icon={<IconPlayerPlay size={17} stroke={2} />} label={product.videoCta.label} variant="muted" />
				</div>
			</div>
			<div className={styles.media}>
				<PlaceholderMedia caption={product.caption} icon={product.icon} />
			</div>
		</article>
	);
}
