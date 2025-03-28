/* * */

import Image from 'next/image';

import styles from './styles.module.css';

/* * */

export function Background1() {
	return <Image alt="background" className={styles.root} height={960} objectFit="cover" src="/background-1.jpg" width={1920} />;
}
