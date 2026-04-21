/* * */

import { Section } from '../../layout/Section';
import { Loader } from '../Loader';

/* * */

interface LoadingOverlayProps {
	size?: 'lg' | 'md' | 'sm' | 'xl'
}

export function LoadingSection({ size = 'md' }: LoadingOverlayProps) {
	return (
		<Section alignItems="center">
			<Loader size={size} />
		</Section>
	);
}
