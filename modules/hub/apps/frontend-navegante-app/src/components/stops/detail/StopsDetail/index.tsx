'use client';

import { StopsDetailContextProvider } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailView } from '@/components/stops/detail/StopsDetailView';
import { StopsDetailViewClose } from '@/components/stops/detail/StopsDetailViewClose';
import { useSelectedStop } from '@/hooks/use-selected-stop';
import { Drawer } from '@mantine/core';

import styles from './styles.module.css';

/* * */

export function StopsDetail() {
	//

	//
	// A. Setup variables

	const { selectedStopId, selectStopId } = useSelectedStop();

	//
	// B. Render componentss

	return (
		<Drawer.Root
			onClose={() => selectStopId(null)}
			opened={!!selectedStopId}
			padding={0}
			position="bottom"
			size="95%"
		>

			<Drawer.Overlay />

			<Drawer.Content classNames={{ content: styles.content }}>

				<Drawer.Header classNames={{ header: styles.header }}>
					<StopsDetailViewClose />
				</Drawer.Header>

				<Drawer.Body classNames={{ body: styles.body }}>
					{selectedStopId && (
						<StopsDetailContextProvider stopId={selectedStopId}>
							<StopsDetailView />
						</StopsDetailContextProvider>
					)}
				</Drawer.Body>

			</Drawer.Content>

		</Drawer.Root>
	);
}
