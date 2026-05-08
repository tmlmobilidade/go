'use client';

import { type ReactNode, useRef } from 'react';

import styles from './styles.module.css';

import { useUserPreference } from '../../../hooks/use-user-preference';

/* * */

const MIN_PANE_FRACTION = 0.1; // Smallest size a pane can have in fraction units

/* * */

interface PanesManagerProps {
	id: string
	panes: ReactNode[]
}

/* * */

export function PanesManager({ id, panes }: PanesManagerProps) {
	//

	//
	// A. Setup variables

	const containerRef = useRef<HTMLDivElement | null>(null);

	const [paneFractions, setPaneFractions] = useUserPreference<number[]>('panes', `${id}:fractions`, Array(panes.length).fill(1 / panes.length));

	//
	// B. Transform data

	const gridTemplateColumns = paneFractions
		.map((fraction, index) => index > 0 ? `auto ${fraction}fr` : `${fraction}fr`)
		.join(' ');

	//
	// C. Handle actions

	const handleMouseDown = (index: number, mouseDownEvent: React.MouseEvent) => {
		// Prevent default behavior (e.g., text selection)
		mouseDownEvent.preventDefault();
		// Get the width of the parent container
		const containerWidth = containerRef.current?.getBoundingClientRect().width || 1;
		// Set the global cursor to indicate resizing
		document.body.style.cursor = 'grabbing';
		// Handle the mouse movement
		const onMouseMove = (moveMoveEvent: MouseEvent) => {
			// Calculate the difference in mouse position
			// and what that means in terms of fractions of the container width
			const deltaX = moveMoveEvent.clientX - mouseDownEvent.clientX;
			const deltaFraction = deltaX / containerWidth;
			// Calculate the new fractions for the panes
			const newFractions = [...paneFractions];
			newFractions[index] = (newFractions[index] ?? 0) + deltaFraction;
			newFractions[index + 1] = (newFractions[index + 1] ?? 0) - deltaFraction;
			// Ensure panes respect min fraction constraint
			if (newFractions.some(f => f < MIN_PANE_FRACTION)) return;
			// Normalize fractions to maintain total sum of 1
			const total = newFractions.reduce((sum, val) => sum + val, 0);
			const newFractionsNormalized = newFractions.map(f => f / total);
			// Update the state with the new values
			setPaneFractions(newFractionsNormalized);
		};
		// Reset the cursor to default and remove the event listeners
		const onMouseUp = () => {
			document.body.style.cursor = '';
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};
		// Add event listeners for mouse movement and release
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	};

	const handleDoubleClick = () => {
		// Reset all panes to equal fractions
		const newFractions = Array(panes.length).fill(1 / panes.length);
		// Update the state with the new values
		setPaneFractions(newFractions);
		// Reset the cursor to default
		document.body.style.cursor = '';
		// Add animation to the panes manager
		if (containerRef.current) {
			const animationDuration = 100; // milliseconds
			containerRef.current.style.transition = `grid-template-columns ${animationDuration}ms ease-in-out`;
			// Remove the transition after it completes
			setTimeout(() => {
				if (containerRef.current) {
					containerRef.current.style.transition = '';
				}
			}, animationDuration);
		}
	};

	//
	// D. Render components

	if (panes.length > 2) {
		return <p>Currently, only 2 panes are supported.</p>;
	}

	return (
		<div ref={containerRef} className={styles.container} style={{ gridTemplateColumns }}>
			{panes.filter(item => !!item).map((pane, index) => (
				<div key={index} className={styles.innerWrapper}>
					{pane}
					{(index < panes.length - 1) && (
						<div className={styles.handleWrapper} onDoubleClick={handleDoubleClick} onMouseDown={event => handleMouseDown(index, event)}>
							<div className={styles.handle} />
						</div>
					)}
				</div>
			))}
		</div>
	);

	//
}
