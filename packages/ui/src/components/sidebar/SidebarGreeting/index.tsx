'use client';

import { Skeleton } from '@mantine/core';
import { useState } from 'react';

import { useMeContext } from '../../../contexts/Me.context';
import { Label } from '../../display/Label';

/* * */

export interface SidebarGreetingProps {
	availableGreetings?: string[]
}

/* * */

export function SidebarGreeting({ availableGreetings = ['Olá', 'Hi', 'Hey', 'Oi', 'Hallo', 'Hola', 'Ciao', 'Hej'] }: SidebarGreetingProps) {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const [drawnGreeting] = useState(availableGreetings[(availableGreetings.length * Math.random()) | 0]);

	//
	// B. Render components

	if (!meContext.data.user?.first_name) {
		return <Skeleton h={18} w={120} />;
	}

	return (
		<>
			<Label size="md" caps singleLine>{drawnGreeting} {meContext.data.user.first_name}</Label>
			{/* <Label size="sm" variant="warning" caps singleLine>Situação estabilizada, continuamos a monitorizar.</Label> */}
		</>
	);

	//
}
