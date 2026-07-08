'use client';

/* * */

import { AppleStyleCarousel } from '@/components/common/Carousel';
import { DemoVideoModal } from '@/components/common/DemoVideoModal';
import { homepageContent } from '@/content/homepage';
import { offerDemoContent } from '@/content/offer-demo';
import { IconPlayerPlay } from '@tabler/icons-react';
import { Button } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

import styles from './styles.module.css';

/* * */

export function OfferSection() {
	//

	//
	// A. Setup variables

	const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

	//
	// B. Transform data

	const activeModule = useMemo(() => {
		return offerDemoContent.modules.find(module => module.id === 'lines') ?? offerDemoContent.modules[0];
	}, []);

	//
	// D. Handle actions

	const handleOpenDemoModal = () => {
		setIsDemoModalOpen(true);
	};

	const handleCloseDemoModal = () => {
		setIsDemoModalOpen(false);
	};

	//
	// F. Render components

	return (
		<>
			<div className={styles.sectionHeader}>
				<span className={styles.eyebrow}>{homepageContent.productIntro.eyebrow}</span>
				<h2>{homepageContent.productIntro.title}</h2>
				<p>{homepageContent.productIntro.body}</p>
			</div>
			<div className={styles.demoActions}>
				<Button icon={<IconPlayerPlay size={18} stroke={2.4} />} label={offerDemoContent.demo.ctaLabel} onClick={handleOpenDemoModal} />
			</div>
			<div className={styles.container}>
				{/* <div className={styles.browserBar}>
					<div aria-hidden="true" className={styles.windowControls}>
						<span />
						<span />
						<span />
					</div>
					<div className={styles.addressBar}>{offerDemoContent.chrome.url}</div>
					<div className={styles.statusPill}>{offerDemoContent.chrome.status}</div>
				</div> */}
				<AppleStyleCarousel
					items={[
						{
							id: 'oferta',
							image: '/hub/assets/demo/lines.png',
						},
						{
							id: 'paragens',
							image: '/hub/assets/demo/stops.png',
						},
						{
							id: 'gtfs',
							image: '/hub/assets/demo/lines.png',
						},
					]}
				/>
			</div>

			<DemoVideoModal
				onClose={handleCloseDemoModal}
				opened={isDemoModalOpen}
				videoSrc={activeModule.video?.src ?? ''}
			/>
		</>
	);

	//
}
