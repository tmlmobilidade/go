'use client';

/* * */

import { VideoPlayer } from '@/components/common/VideoPlayer';
import { IconPlayerPlay } from '@tabler/icons-react';
import { Modal } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface DemoVideoModalProps {
	onClose: () => void
	opened: boolean
	videoSrc: string
}

export function DemoVideoModal({ onClose, opened, videoSrc }: DemoVideoModalProps) {
	//

	//
	// A. Render components

	return (
		<Modal
			onClose={onClose}
			opened={opened}
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
					onClick={onClose}
					type="button"
				>
					×
				</button>

				{videoSrc ? (
					<VideoPlayer
						src={videoSrc}
						title="Demo de vídeo"
					/>
				) : (
					<div className={styles.videoPlaceholder}>
						<IconPlayerPlay size={34} stroke={2.2} />
						<strong>Demo em preparação</strong>
						<span>Adicione o ficheiro de vídeo para reproduzir aqui.</span>
					</div>
				)}
			</div>
		</Modal>
	);

	//
}
