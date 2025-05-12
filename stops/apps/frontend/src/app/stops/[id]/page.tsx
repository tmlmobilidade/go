import Navigation from '@/components/Navigation';
import Stop from '@/components/Stop';
import { StopDetailContextProvider } from '@/contexts/StopDetail.context';
import { StopsListContextProvider } from '@/contexts/StopsList.context';

import styles from './styles.module.css';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	console.log('id', id);
	return (
		<div className={styles.container}>
			<StopsListContextProvider>
				<Navigation />
			</StopsListContextProvider>
			<StopDetailContextProvider stopId={id}>
				<Stop paramId={id} />
			</StopDetailContextProvider>
		</div>
	);
}
