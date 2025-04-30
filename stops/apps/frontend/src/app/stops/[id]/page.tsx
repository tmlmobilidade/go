import Navigation from '@/components/Navigation';
import Stop from '@/components/Stop';
import { StopDetailContextProvider } from '@/contexts/StopDetail.context';
import { StopListContextProvider } from '@/contexts/StopList.context';

import styles from './styles.module.css';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	console.log('id', id);
	return (
		<div className={styles.container}>
			<StopListContextProvider>
				<Navigation />
			</StopListContextProvider>
			<StopDetailContextProvider stopId={id}>
				<Stop paramId={id} />
			</StopDetailContextProvider>
		</div>
	);
}
