'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './styles.module.css';

/* * */

const ROOT_ELEM_ID = 'sidebar-item-tooltip';

/* * */

interface SidebarItemTooltipProps {
	label: string
	target: HTMLElement | null
}

/* * */

export function SidebarItemTooltip({ label, target }: SidebarItemTooltipProps) {
	//

	//
	// A. Setup variables

	const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
	const [targetPosition, setTargetPosition] = useState<null | { height: number, right: number, top: number }>(null);

	//
	// B. Handle actions

	const createRootElement = () => {
		const newEl = document.createElement('div');
		newEl.id = ROOT_ELEM_ID;
		document.body.appendChild(newEl);
	};

	useEffect(() => {
		const element = document.getElementById(ROOT_ELEM_ID);
		if (element) setRootElement(element);
		else createRootElement();
	}, []);

	const captureTargetPosition = () => {
		if (!target) return;
		const rect = target?.getBoundingClientRect();
		if (!rect) return;
		setTargetPosition({
			height: rect.height,
			right: rect.right,
			top: rect.top,
		});
	};

	useEffect(() => {
		captureTargetPosition();
		window.addEventListener('scroll', captureTargetPosition, true); // "true" = capture phase, so it works on nested scrollables
		window.addEventListener('resize', captureTargetPosition);
		return () => {
			window.removeEventListener('scroll', captureTargetPosition, true);
			window.removeEventListener('resize', captureTargetPosition);
		};
	}, [target]);

	//
	// C. Render components

	if (!rootElement || !targetPosition) {
		return null;
	}

	return createPortal(
		<div
			className={styles.tooltip}
			style={{
				left: targetPosition.right + 5,
				top: targetPosition.top + targetPosition.height / 2,
				transform: 'translateY(-50%)',
			}}
		>
			{label}
		</div>,
		rootElement,
	);

	//
}
