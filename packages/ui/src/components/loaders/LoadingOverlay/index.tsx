/* * */

import { Loader } from '@/components/loaders/Loader';

import styles from './styles.module.css';

/* * */

interface LoadingOverlayProps {
	dimmed?: boolean
	fullscreen?: boolean
	size?: 'lg' | 'md' | 'sm' | 'xl'
}

export function LoadingOverlay({ dimmed, fullscreen, size = 'md' }: LoadingOverlayProps) {
	return (
		<div className={styles.root} data-dimmed={dimmed} data-fullscreen={fullscreen}>
			<Loader size={size} />
		</div>
	);
}
