'use client';
/* * */

import styles from './styles.module.css';

/* * */

interface Props {
	backgroundColor?: string
	foregroundColor?: string
	isFirstStop?: boolean
	isLastStop?: boolean
	isSelected: boolean
	stopId: string
	stopSequence: number
}

/* * */

export function PathWaypointSpine({ backgroundColor, isFirstStop, isLastStop, isSelected }: Props) {
	//

	//
	// A. Render components

	return (
		<div
			className={`${styles.container} ${isFirstStop && styles.isFirstStop} ${isLastStop && styles.isLastStop} ${isSelected && styles.isSelected}`}
			style={{ backgroundColor: backgroundColor }}
		/>
	);

	//
}
