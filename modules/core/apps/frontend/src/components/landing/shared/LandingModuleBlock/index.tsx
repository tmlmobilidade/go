'use client';

import { type PropsWithChildren } from 'react';

import styles from './styles.module.css';

/* * */

interface LandingModuleBlockProps {
	description: string
	index: number
	subtitle: string
	title: string
}

/* * */

export function LandingModuleBlock({ children, description, index, subtitle, title }: PropsWithChildren<LandingModuleBlockProps>) {
	return (
		<div className={styles.container}>

			<div className={styles.header}>
				<p className={styles.index}>{index}</p>
				<p className={styles.title}>{title}</p>
			</div>

			<div className={styles.wrapper}>
				<h2 className={styles.subtitle}>{subtitle}</h2>
				<p className={styles.description}>{description}</p>
				{children}
			</div>

		</div>
	);
}
