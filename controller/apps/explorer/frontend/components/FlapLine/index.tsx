'use client';

/* * */

import { CHARACTER_SETS, Flap } from '@/components/Flap';

import styles from './styles.module.css';

/* * */

interface Props {
	characterSets?: (keyof typeof CHARACTER_SETS)[]
	count?: number
	string?: string
}

/* * */

export function FlapLine({ characterSets = ['alphabet', 'numeric', 'special'], count, string }: Props) {
	const flapLineSize = count ?? string?.length ?? 3;
	return (
		<div className={styles.container}>
			{Array.from({ length: flapLineSize }).map((_, index) => (
				<Flap key={index} char={string?.[index]} characterSets={characterSets} />
			))}
		</div>
	);
}
