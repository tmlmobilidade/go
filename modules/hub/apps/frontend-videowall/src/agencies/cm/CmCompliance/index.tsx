/* * */

import imageSrc from '@/components/Compliance/portugal2020.jpg';
import Image from 'next/image';

import styles from './styles.module.css';

/* * */

export function CmCompliance() {
	return (
		<div className={styles.container}>
			<Image alt="Portugal 2020" src={imageSrc} width={320} priority />
		</div>
	);
}
