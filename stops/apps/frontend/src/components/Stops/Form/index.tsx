'use client';

/* * */

import { Pane } from '@tmlmobilidade/ui';

import { AdministratorInfo } from './AdministratorInfo';
import { ImagesVideos } from './Images-Videos';
import { Infraestructures } from './Infrastructures';
import { IntermodalConnections } from './IntermodalConnections';
import { NotesComments } from './Notes-Comments';
import { PublicInformation } from './PublicInformation';
import { ServedEquipment } from './ServedEquipment';
import { Shelter } from './Shelter';
import { StopDetails } from './Stopdetails';
import { StopHeader } from './StopHeader';

/* * */

export function FormInfos() {
	return (
		<Pane header={[<StopHeader />]}>
			<StopDetails />
			<AdministratorInfo />
			<Shelter />
			<Infraestructures />
			<PublicInformation />
			<ServedEquipment />
			<IntermodalConnections />
			<ImagesVideos />
			<NotesComments />
		</Pane>
	);
}
