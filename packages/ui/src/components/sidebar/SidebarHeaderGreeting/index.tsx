'use client';

import { Skeleton } from '@mantine/core';
import { useState } from 'react';

import { useMeContext } from '../../../contexts/Me.context';
import { Label } from '../../display/Label';

/* * */

export interface SidebarHeaderGreetingProps {
	availableGreetings?: string[]
}

/* * */

export function SidebarHeaderGreeting({ availableGreetings = ['Olá', 'Hi', 'Hey', 'Oi', 'Hallo', 'Hola', 'Ciao', 'Hej'] }: SidebarHeaderGreetingProps) {
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
		<Label size="md" caps singleLine>{drawnGreeting} {meContext.data.user.first_name}</Label>
	);
}
