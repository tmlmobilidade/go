'use client';

import { LinesDetailContextProvider } from '@/components/lines/detail/LinesDetail.context';
import { LinesDetailView } from '@/components/lines/detail/LinesDetailView';
import { useSelectedLine } from '@/hooks/use-selected-line';
import { Drawer } from '@mantine/core';

/* * */

export function LinesDetail() {
	//

	//
	// A. Setup variables

	const { selectedLineId, selectLineId } = useSelectedLine();

	//
	// B. Render componentss

	return (
		<Drawer
			onClose={() => selectLineId(null)}
			opened={!!selectedLineId}
			padding={0}
			position="bottom"
			size="95%"
			withCloseButton={false}
		>
			{selectedLineId && (
				<LinesDetailContextProvider lineId={selectedLineId}>
					<LinesDetailView />
				</LinesDetailContextProvider>
			)}
		</Drawer>
	);
}
