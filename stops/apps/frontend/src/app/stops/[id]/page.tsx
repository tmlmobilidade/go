import { Navigation } from '@/components/Navigation';
import Stop from '@/components/Stop';
import { SearchbarContextProvider } from '@/contexts/Searchbar.context';
import { StopsDetailContextProvider } from '@/contexts/StopsDetail.context';
import { StopsListContextProvider } from '@/contexts/StopsList.context';

import styles from './styles.module.css';
import { PanesManager, useDisclosure } from '@tmlmobilidade/ui';
import { Form } from '@/components/Form';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	console.log('id', id);
	return (
		<PanesManager
			panes={[
				<div className={styles.container}>
					{id === 'new' ? (
						<StopsListContextProvider>
							<StopsDetailContextProvider stopId={id}>
								<Form />
							</StopsDetailContextProvider>
						</StopsListContextProvider>
					) : (
						<>
							<StopsListContextProvider>
								<SearchbarContextProvider>
									<Navigation />
								</SearchbarContextProvider>
							</StopsListContextProvider>
							<StopsDetailContextProvider stopId={id}>
								<Stop paramId={id} />
							</StopsDetailContextProvider>
						</>
					)}
				</div>
			]}
		/>
	);
}
