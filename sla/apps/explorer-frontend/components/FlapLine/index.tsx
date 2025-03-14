'use client';

/* * */

import { Flap } from '@/components/Flap';

import styles from './styles.module.css';

/* * */

interface Props {
	count?: number
	string?: string
}

/* * */

export function FlapLine({ count, string }: Props) {
	const flapLineSize = count ?? string?.length ?? 3;
	return (
		<div className={styles.container}>
			{Array.from({ length: flapLineSize }).map((_, index) => (
				<Flap key={index} char={string?.[index]} />
			))}
		</div>
	);
}
