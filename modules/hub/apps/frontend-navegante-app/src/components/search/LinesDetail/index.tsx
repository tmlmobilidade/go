'use client';

import { LinesDetailContextProvider } from '@/components/lines/detail/LinesDetail.context';
import { LinesDetailView } from '@/components/lines/detail/LinesDetailView';
import { LinesDetailViewClose } from '@/components/lines/detail/LinesDetailViewClose';
import { useSelectedLine } from '@/hooks/use-selected-line';
import { Drawer } from '@mantine/core';

import styles from './styles.module.css';

/* * */

export function LinesDetail() {
	//

	//
	// A. Setup variables

	const { selectedLineId, selectLineId } = useSelectedLine();

	//
	// B. Render componentss

	return (
		<Drawer.Root
			onClose={() => selectLineId(null)}
			opened={!!selectedLineId}
			padding={0}
			position="bottom"
			size="95%"
		>

			<Drawer.Overlay />

			<Drawer.Content classNames={{ content: styles.content }}>

				<Drawer.Header classNames={{ header: styles.header }}>
					<LinesDetailViewClose />
				</Drawer.Header>

				<Drawer.Body classNames={{ body: styles.body }}>
					{selectedLineId && (
						<LinesDetailContextProvider lineId={selectedLineId}>
							<LinesDetailView />
						</LinesDetailContextProvider>
					)}
				</Drawer.Body>

			</Drawer.Content>

		</Drawer.Root>
	);
}
