'use client';

/* * */

import styles from './styles.module.css';

/* * */

interface HeaderProps {
	description: string
	title: string
}

/* * */

export default function Header({ description, title }: HeaderProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.container}>
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	);
}
