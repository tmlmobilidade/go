'use client';

/* * */

import { Pane } from '@tmlmobilidade/ui';

import { Accessibility } from './Accessibility';
import { AdministratorInfo } from './AdministratorInfo';
import { Affectation } from './Affectation';
import { ImagesVideos } from './Images-Videos';
import { Infraestructures } from './Infrastructures';
import { IntermodalConnections } from './IntermodalConnections';
import { NotesComments } from './Notes-Comments';
import { PublicInformation } from './PublicInformation';
import { ServedEquipment } from './ServedEquipment';
import { Shelter } from './Shelter';
import { StopDetails } from './Stopdetails';

/* * */

export function FormInfos() {
	return (
		<Pane>
			<StopDetails />
			<AdministratorInfo />
			<Affectation />
			<Shelter />
			<Infraestructures />
			<PublicInformation />
			<Accessibility />
			<ServedEquipment />
			<IntermodalConnections />
			<ImagesVideos />
			<NotesComments />
		</Pane>
	);
}
