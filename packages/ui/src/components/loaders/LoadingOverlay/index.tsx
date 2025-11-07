/* * */

import styles from './styles.module.css';

import { Loader } from '../Loader';

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
