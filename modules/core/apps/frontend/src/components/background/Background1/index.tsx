/* * */

import Image from 'next/image';

import styles from './styles.module.css';

import BackgroundImage from './background-1.jpg';

/* * */

export function Background1() {
	return <Image alt="background" className={styles.root} height={960} objectFit="cover" src={BackgroundImage} width={1920} />;
}
