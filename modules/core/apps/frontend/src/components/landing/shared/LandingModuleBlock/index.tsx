'use client';

import styles from './styles.module.css';

import { LandingVideoModalButton } from '../../modules/LandingVideoModalButton';

/* * */

interface LandingModuleBlockProps {
	description: string
	index: number
	subtitle: string
	thumbnailSrc: string
	title: string
	videoSrc: string
}

/* * */

export function LandingModuleBlock({ description, index, subtitle, thumbnailSrc, title, videoSrc }: LandingModuleBlockProps) {
	return (
		<div className={styles.container}>

			<div className={styles.header}>
				<p className={styles.index}>{index}</p>
				<p className={styles.title}>{title}</p>
			</div>

			<div className={styles.wrapper}>
				<h2 className={styles.subtitle}>{subtitle}</h2>
				<p className={styles.description}>{description}</p>
				<LandingVideoModalButton
					thumbnailSrc={thumbnailSrc}
					videoSrc={videoSrc}
				/>
			</div>

		</div>
	);
}
