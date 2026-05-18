'use client';

/* * */

import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarRightCollapse } from '@tabler/icons-react';
import { type ReactNode, useMemo, useRef } from 'react';

import styles from './styles.module.css';

import { useUserPreference } from '../../../hooks/use-user-preference';

/* * */

const MIN_PANE_FRACTION = 0.1;
const COLLAPSE_THRESHOLD_FRACTION = 0.06;
const COLLAPSED_PANE_WIDTH = '40px';

/* * */

type CollapsedPane = 0 | 1 | 'none';

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
	const latestFractionsRef = useRef<number[]>([]);

	const visiblePanes = useMemo(() => panes.filter(Boolean), [panes]);

	const defaultPaneFractions = useMemo(
		() => Array(visiblePanes.length).fill(1 / visiblePanes.length),
		[visiblePanes.length],
	);

	const [paneFractions, setPaneFractions, savePaneFractions] = useUserPreference<number[]>(
		'panes',
		`${id}:fractions`,
		defaultPaneFractions,
	);

	const [collapsedPane, setCollapsedPane] = useUserPreference<CollapsedPane>(
		'panes',
		`${id}:collapsed`,
		'none',
	);

	//
	// B. Transform data

	const normalizedPaneFractions = paneFractions.length === visiblePanes.length
		? paneFractions
		: defaultPaneFractions;

	const getGridTemplateColumns = (fractions: number[]) => {
		return fractions
			.map((fraction, index) => index > 0 ? `auto ${fraction}fr` : `${fraction}fr`)
			.join(' ');
	};

	const gridTemplateColumns = (() => {
		if (collapsedPane === 0) return `${COLLAPSED_PANE_WIDTH} 1fr`;
		if (collapsedPane === 1) return `1fr ${COLLAPSED_PANE_WIDTH}`;

		return getGridTemplateColumns(normalizedPaneFractions);
	})();

	//
	// C. Handle actions

	const animateGrid = () => {
		if (!containerRef.current) return;

		const animationDuration = 120;

		containerRef.current.style.transition = `grid-template-columns ${animationDuration}ms ease-in-out`;

		setTimeout(() => {
			if (containerRef.current) {
				containerRef.current.style.transition = '';
			}
		}, animationDuration);
	};

	const handleExpand = () => {
		animateGrid();
		setCollapsedPane('none');
	};

	const handleCollapse = (index: 0 | 1) => {
		animateGrid();
		setCollapsedPane(index);
		document.body.style.cursor = '';
	};

	const handleMouseDown = (index: number, mouseDownEvent: React.MouseEvent) => {
		mouseDownEvent.preventDefault();

		const containerWidth = containerRef.current?.getBoundingClientRect().width || 1;
		const startFractions = [...normalizedPaneFractions];

		latestFractionsRef.current = startFractions;

		document.body.style.cursor = 'grabbing';

		const onMouseMove = (moveMoveEvent: MouseEvent) => {
			const deltaX = moveMoveEvent.clientX - mouseDownEvent.clientX;
			const deltaFraction = deltaX / containerWidth;

			const newFractions = [...startFractions];

			newFractions[index] = (newFractions[index] ?? 0) + deltaFraction;
			newFractions[index + 1] = (newFractions[index + 1] ?? 0) - deltaFraction;

			if ((newFractions[index] ?? 0) < COLLAPSE_THRESHOLD_FRACTION) {
				handleCollapse(index as 0 | 1);
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onMouseUp);
				return;
			}

			if ((newFractions[index + 1] ?? 0) < COLLAPSE_THRESHOLD_FRACTION) {
				handleCollapse((index + 1) as 0 | 1);
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onMouseUp);
				return;
			}

			if (newFractions.some(fraction => fraction < MIN_PANE_FRACTION)) return;

			const total = newFractions.reduce((sum, value) => sum + value, 0);
			const newFractionsNormalized = newFractions.map(fraction => fraction / total);

			latestFractionsRef.current = newFractionsNormalized;

			if (containerRef.current) {
				containerRef.current.style.gridTemplateColumns = getGridTemplateColumns(newFractionsNormalized);
			}
		};

		const onMouseUp = () => {
			document.body.style.cursor = '';

			const finalFractions = latestFractionsRef.current;

			setPaneFractions(finalFractions, { save: false });
			savePaneFractions(finalFractions);

			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	};

	const handleDoubleClick = () => {
		const newFractions = Array(visiblePanes.length).fill(1 / visiblePanes.length);

		animateGrid();
		setCollapsedPane('none');
		setPaneFractions(newFractions);
		document.body.style.cursor = '';
	};

	//
	// D. Render components

	if (visiblePanes.length > 2) {
		return <p>Currently, only 2 panes are supported.</p>;
	}

	return (
		<div ref={containerRef} className={styles.container} style={{ gridTemplateColumns }}>
			{visiblePanes.map((pane, index) => {
				const isCollapsed = collapsedPane === index;

				if (isCollapsed) {
					return (
						<button key={index} className={styles.collapsedPane} onClick={handleExpand}>
							{index === 0 ? (
								<IconLayoutSidebarLeftCollapse size={20} />
							) : (
								<IconLayoutSidebarRightCollapse size={20} />
							)}
						</button>
					);
				}

				return (
					<div key={index} className={styles.innerWrapper}>
						{pane}

						{collapsedPane === 'none' && index < visiblePanes.length - 1 && (
							<div
								className={styles.handleWrapper}
								onDoubleClick={handleDoubleClick}
								onMouseDown={event => handleMouseDown(index, event)}
							>
								<div className={styles.handle} />
							</div>
						)}
					</div>
				);
			})}
		</div>
	);

	//
}
