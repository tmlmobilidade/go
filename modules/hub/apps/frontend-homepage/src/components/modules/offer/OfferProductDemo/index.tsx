'use client';

/* * */

import { VideoPlayer } from '@/components/common/VideoPlayer';
import { OfferDemoWorkspace } from '@/components/modules/offer/OfferDemoWorkspace';
import { homepageContent } from '@/content/homepage';
import { offerDemoContent, type OfferDemoModuleId } from '@/content/offer-demo';
import { IconPlayerPlay } from '@tabler/icons-react';
import { Button, Modal, type SidebarStaticGroupId, type SidebarStaticItemId, SidebarStaticPanel } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

import styles from './styles.module.css';

/* * */

const VISIBLE_GROUP_IDS = ['overview', 'administration', 'operation', 'offer', 'calendar_management'] as const satisfies readonly SidebarStaticGroupId[];
const OPEN_GROUP_IDS = ['offer'] as const satisfies readonly SidebarStaticGroupId[];
const VISIBLE_ITEM_IDS = offerDemoContent.modules.map(module => module.id) satisfies readonly SidebarStaticItemId[];

/* * */

export function OfferProductDemo() {
	//

	//
	// A. Setup variables

	const [activeModuleId, setActiveModuleId] = useState<OfferDemoModuleId>('lines');
	const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

	//
	// B. Transform data

	const activeModule = useMemo(() => {
		return offerDemoContent.modules.find(module => module.id === activeModuleId) ?? offerDemoContent.modules[0];
	}, [activeModuleId]);

	//
	// D. Handle actions

	const handleActiveItemIdChange = (itemId: SidebarStaticItemId) => {
		const hasModule = offerDemoContent.modules.some(module => module.id === itemId);
		if (hasModule) setActiveModuleId(itemId as OfferDemoModuleId);
	};

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
				<div className={styles.browserBar}>
					<div aria-hidden="true" className={styles.windowControls}>
						<span />
						<span />
						<span />
					</div>
					<div className={styles.addressBar}>{offerDemoContent.chrome.url}</div>
					<div className={styles.statusPill}>{offerDemoContent.chrome.status}</div>
				</div>
				<div className={styles.webview}>
					<SidebarStaticPanel
						activeItemId={activeModuleId}
						environmentLabel={offerDemoContent.chrome.environment}
						greeting={offerDemoContent.chrome.greeting}
						logoSrc={offerDemoContent.chrome.logoSrc}
						onActiveItemIdChange={handleActiveItemIdChange}
						openGroupIds={OPEN_GROUP_IDS}
						visibleGroupIds={VISIBLE_GROUP_IDS}
						visibleItemIds={VISIBLE_ITEM_IDS}
					/>
					<OfferDemoWorkspace module={activeModule} onDemoOpen={handleOpenDemoModal} />
				</div>
			</div>
			<Modal
				onClose={handleCloseDemoModal}
				opened={isDemoModalOpen}
				size="80vw"
				withCloseButton={false}
				classNames={{
					body: styles.modalBody,
					content: styles.modalContent,
				}}
				centered
				closeOnClickOutside
			>
				<div className={styles.videoFrame}>
					<button
						aria-label="Fechar demo"
						className={styles.closeButton}
						onClick={handleCloseDemoModal}
						type="button"
					>
						×
					</button>

					{activeModule.video?.src ? (
						<VideoPlayer
							key={activeModule.id}
							poster={activeModule.screenshot?.src}
							src={activeModule.video.src}
							title={`${offerDemoContent.demo.modalTitle}: ${activeModule.title}`}
						/>
					) : (
						<div className={styles.videoPlaceholder}>
							<IconPlayerPlay size={34} stroke={2.2} />
							<strong>Demo em preparação</strong>
							<span>Adicione o ficheiro de vídeo em `offer-demo.ts` para reproduzir aqui.</span>
						</div>
					)}
				</div>
			</Modal>
		</>
	);

	//
}
