/* * */

import { type OfferDemoModule } from '@/content/offer-demo';
import { offerDemoContent } from '@/content/offer-demo';
import { IconPlayerPlay } from '@tabler/icons-react';
import { Button } from '@tmlmobilidade/ui';
import Image from 'next/image';

import styles from './styles.module.css';

/* * */

interface OfferDemoWorkspaceProps {
	module: OfferDemoModule
	onDemoOpen: () => void
}

/* * */

export function OfferDemoWorkspace({ module, onDemoOpen }: OfferDemoWorkspaceProps) {
	//

	//
	// F. Render components

	return (
		<div className={styles.container}>
			{module.screenshot ? (
				<>
					<Image
						alt={module.screenshot.alt}
						className={styles.screenshot}
						sizes="(max-width: 980px) calc(100vw - 72px), calc(100vw - 250px)"
						src={module.screenshot.src}
						fill
						unoptimized
					/>
					<div className={styles.overlay}>
						<Button icon={<IconPlayerPlay size={18} stroke={2.4} />} label={offerDemoContent.demo.playLabel} onClick={onDemoOpen} />
					</div>
				</>
			) : (
				<div className={styles.placeholder}>
					<span>{module.title}</span>
					<strong>Preview em preparação</strong>
				</div>
			)}
		</div>
	);

	//
}
