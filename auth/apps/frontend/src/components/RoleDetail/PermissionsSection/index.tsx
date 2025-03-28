'use client';

/* * */

import {
	Section,
	SegmentedControl,
	Surface,
} from '@tmlmobilidade/ui';
import { useState } from 'react';

import PermissionsTab from '../PermissionsTab';

const PermissionsSectionOptions = [
	{
		description: 'Permissões do utilizador',
		label: 'Permissões',
		value: 'permissions',
	},
	{
		description: 'Roles do utilizador',
		label: 'Roles',
		value: 'roles',
	},
];

export default function PermissionsSection() {
	//
	// A. Setup variables
	const [selectedOption, setSelectedOption] = useState<string>(PermissionsSectionOptions[0].value);

	//
	// B. Render components

	return (
		<Section
			description="As referências (Linhas, Paragens, Municípios, Etc...) afetadas deste alerta."
			title="Referências"
		>
			<Surface gap="md" padding="sm">
				<SegmentedControl
					data={PermissionsSectionOptions}
					onChange={(value: string) => setSelectedOption(value)}
					value={selectedOption}
					fullWidth
				/>

				{selectedOption === 'permissions' && <PermissionsTab />}
				{selectedOption === 'roles' && <PermissionsSectionRoles />}
			</Surface>
		</Section>
	);
}

function PermissionsSectionRoles() {
	return (
		<>
			ROLE MANAGEMENT
		</>
	);
}
