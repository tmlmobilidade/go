'use client';

import { Scroller } from '@mantine/core';
import { type PropsWithChildren } from 'react';

/* * */

export function DataTableScroller({ children }: PropsWithChildren) {
	return (
		<Scroller
			edgeGradientColor="transparent"
			endControlIcon={<></>}
			showEndControl={false}
			showStartControl={false}
			startControlIcon={<></>}
		>
			<div>
				{children}
			</div>
		</Scroller>
	);
}
