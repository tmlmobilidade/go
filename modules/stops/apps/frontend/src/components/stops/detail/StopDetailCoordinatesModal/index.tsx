'use client';

/* * */

import { StopDetailCoordinatesMap } from '@/components/stops/detail/StopDetailCoordinatesModal/StopDetailCoordinatesMap';
import { StopDetailCoordinatesSelect } from '@/components/stops/detail/StopDetailCoordinatesModal/StopDetailCoordinatesSelect';
import { closeStopDetailCoordinatesModal } from '@/contexts/StopDetailCoordinates.modal';
import { CloseButton, Divider, Label, MapContextProvider, Pane, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

/** Separate preference scope so modal search-pin / toolbar state does not overwrite the detail page map. */
const DETAIL_COORDINATES_MAP_SCOPE = 'map:stop-detail-coordinates-modal';

export function StopDetailCoordinatesModal() {
	//

	return (
		<Pane
			header={[
				<Toolbar key="stop-detail-coordinates-toolbar">
					<CloseButton onClick={closeStopDetailCoordinatesModal} type="close" />
					<Label size="lg" singleLine>Editar coordenadas</Label>
					<Spacer />
				</Toolbar>,
			]}
		>
			<div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
				<MapContextProvider preferenceScope={DETAIL_COORDINATES_MAP_SCOPE}>
					<StopDetailCoordinatesMap />
					<Divider />
					<StopDetailCoordinatesSelect />
				</MapContextProvider>
			</div>
		</Pane>
	);

	//
}
