'use client';

/* * */

import { useEffect, useRef, useState } from 'react';

import { type SidebarVisualMode } from '../SidebarMode.context';

/* * */

export interface UseSidebarPeekStateArgs {
	collapsed: boolean
}

export function useSidebarPeekState({ collapsed }: UseSidebarPeekStateArgs) {
	const peekOverlayRef = useRef<HTMLDivElement>(null);
	const [isHovering, setIsHovering] = useState(false);
	const [peekMounted, setPeekMounted] = useState(false);
	const [peekExpanded, setPeekExpanded] = useState(false);

	const isPeekAnimating = collapsed && peekMounted;
	const visualMode: SidebarVisualMode = !collapsed
		? 'pinned'
		: isHovering || isPeekAnimating
			? 'hovered'
			: 'collapsed';

	const labelsVisible = visualMode !== 'collapsed';
	const showToggle = visualMode !== 'collapsed';

	useEffect(() => {
		if (!collapsed) {
			setPeekMounted(false);
			setPeekExpanded(false);
			return;
		}

		if (isHovering) {
			setPeekMounted(true);
			const frame = requestAnimationFrame(() => {
				setPeekExpanded(true);
			});
			return () => {
				cancelAnimationFrame(frame);
			};
		}

		setPeekExpanded(false);
	}, [collapsed, isHovering]);

	useEffect(() => {
		if (!peekMounted || peekExpanded) return;

		const el = peekOverlayRef.current;
		const finish = () => {
			setPeekMounted(false);
		};

		if (!el) {
			finish();
			return;
		}

		const onTransitionEnd = (event: TransitionEvent) => {
			if (event.target !== el || event.propertyName !== 'width') return;
			finish();
		};

		el.addEventListener('transitionend', onTransitionEnd);
		const timeout = window.setTimeout(finish, 360);

		return () => {
			el.removeEventListener('transitionend', onTransitionEnd);
			window.clearTimeout(timeout);
		};
	}, [peekExpanded, peekMounted]);

	return {
		isHovering,
		isPeekAnimating,
		labelsVisible,
		peekExpanded,
		peekOverlayRef,
		setIsHovering,
		showToggle,
		visualMode,
	};
}
