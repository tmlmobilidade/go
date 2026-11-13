'use client';

import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

interface LandingInfoBlockProps {
	description: string
	title: string
}

/* * */

export function LandingInfoBlock({ children, description, title }: PropsWithChildren<LandingInfoBlockProps>) {
	return (
		<div className={styles.container}>
			<span className={styles.rule} />
			<h2 className={styles.title}>{title}</h2>
			<p className={styles.description}>{description}</p>
			{children}
		</div>
	);
}
