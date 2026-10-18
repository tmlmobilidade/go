'use client';

import styles from './styles.module.css';

import { LandingVideoModalButton } from '../LandingVideoModalButton';

/* * */

interface LandingModuleBlockContent {
	description: string
	subtitle: string
	thumbnailSrc: string
	videoSrc: string
}

interface LandingModuleBlockProps {
	content: LandingModuleBlockContent[]
	index: number
	title: string
}

/* * */

export function LandingModuleBlock({ content, index, title }: LandingModuleBlockProps) {
	return (
		<div className={styles.container}>

			<div className={styles.header}>
				<p className={styles.index}>{index}</p>
				<p className={styles.title}>{title}</p>
			</div>

			{content.map((item, idx) => (
				<>
					<div key={idx} className={styles.wrapper}>
						<h2 className={styles.subtitle}>{item.subtitle}</h2>
						<p className={styles.description}>{item.description}</p>
						<LandingVideoModalButton
							thumbnailSrc={item.thumbnailSrc}
							videoSrc={item.videoSrc}
						/>
					</div>
					{idx < content.length - 1 && <div className={styles.divider} />}
				</>
			))}

		</div>
	);
}
