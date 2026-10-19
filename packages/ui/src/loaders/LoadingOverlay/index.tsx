/* * */

import styles from './styles.module.css';

import { Loader, type LoaderProps } from '../Loader';

/* * */

interface LoadingOverlayProps {
	dimmed?: boolean
	fullscreen?: boolean
	size?: LoaderProps['size']
}

export function LoadingOverlay({ dimmed, fullscreen, size = 'md' }: LoadingOverlayProps) {
	return (
		<div className={styles.root} data-dimmed={dimmed} data-fullscreen={fullscreen}>
			<Loader size={size} />
		</div>
	);
}
