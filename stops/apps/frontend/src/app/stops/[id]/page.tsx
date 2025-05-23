import { Navigation } from '@/components/Navigation';
import Stop from '@/components/Stop';
import { SearchbarContextProvider } from '@/contexts/Searchbar.context';
import { StopsDetailContextProvider } from '@/contexts/StopsDetail.context';
import { StopsListContextProvider } from '@/contexts/StopsList.context';

import styles from './styles.module.css';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	console.log('id', id);
	return (
		<div className={styles.container}>
			<StopsListContextProvider>
				<SearchbarContextProvider>
					<Navigation />
				</SearchbarContextProvider>
			</StopsListContextProvider>
			<StopsDetailContextProvider stopId={id}>
				<Stop paramId={id} />
			</StopsDetailContextProvider>
		</div>
	);
}
