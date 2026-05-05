/* * */

import { Section } from '../../layout/Section';
import { Loader, type LoaderProps } from '../Loader';

/* * */

interface LoadingOverlayProps {
	fullHeight?: boolean
	size?: LoaderProps['size']
}

export function LoadingSection({ fullHeight = false, size = 'md' }: LoadingOverlayProps) {
	return (
		<Section alignItems="center" height={fullHeight ? '100%' : 'auto'} justifyContent="center">
			<Loader size={size} />
		</Section>
	);
}
