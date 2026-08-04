/* * */

import imageSrc from '@/components/common/Compliance/portugal2020.jpg';
import Image from 'next/image';

import styles from './styles.module.css';

/* * */

interface Props {
	variant?: 'floating' | 'header'
}

/* * */

export function Compliance({ variant = 'floating' }: Props) {
	return (
		<div className={styles.container} data-variant={variant}>
			<Image alt="Portugal 2020" src={imageSrc} width={320} priority />
		</div>
	);
}
