'use client';

import { useLinesOverviewContext } from '@/components/lines/overview/LinesOverview.context';
import { LinesOverviewMapHover } from '@/components/lines/overview/LinesOverviewMapHover';
import { LinesOverviewMapLayer } from '@/components/lines/overview/LinesOverviewMapLayer';
import { LinesOverviewMapPopup } from '@/components/lines/overview/LinesOverviewMapPopup';
import { MapView, Section } from '@tmlmobilidade/ui';

/* * */

export function LinesOverviewMap() {
	//

	//
	// A. Setup variables

	const linesOverviewContext = useLinesOverviewContext();

	//
	// B. Render components

	return (
		<Section height="100%" padding="none">
			<MapView
				id="lines-patterns-map"
				interactiveLayerIds={[linesOverviewContext.data.hitboxLayerId]}
				onClick={linesOverviewContext.actions.handleMapClick}
				onMouseLeave={() => linesOverviewContext.actions.setHoverInfo(null)}
				showSearchPin={false}
				toolbar={false}
			>
				<LinesOverviewMapHover />

				{linesOverviewContext.data.popupInfo && (
					<LinesOverviewMapPopup />
				)}

				<LinesOverviewMapLayer />
			</MapView>
		</Section>
	);

	//
}
