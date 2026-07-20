'use client';

/* * */

import { ReactModalSheetClose } from '@/components/common/bottom-sheet/ReactModalSheetClose';
import { registerActiveBottomSheetSnapController, useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { MAP_BOTTOM_SHEET_INITIAL_SNAP, MAP_BOTTOM_SHEET_SNAP_POINTS } from '@/components/common/bottom-sheet/use-map-bottom-sheet';
import { type PropsWithChildren, useEffect, useId, useMemo, useRef } from 'react';
import { Sheet, type SheetRef } from 'react-modal-sheet';

import styles from './styles.module.css';

/* * */

type BottomSheetHeaderMode = 'default' | 'handle';
type BottomSheetSize = 'fit' | 'full' | 'half' | 'short';

interface BottomSheetProps {
	avoidKeyboard?: boolean
	disableDismiss?: boolean
	headerMode?: BottomSheetHeaderMode
	initialSnap?: number
	mapAware?: boolean
	onClose: () => void
	onCloseEnd?: () => void
	onOpenEnd?: () => void
	onOpenStart?: () => void
	opened: boolean
	size?: BottomSheetSize
	snapPoints?: number[]
	title?: string
	withCloseButton?: boolean
	withCompactCloseButton?: boolean
	withHeaderBackground?: boolean
	withOverlay?: boolean
}

/* * */

const SHEET_SNAP_POINTS_BY_SIZE: Record<BottomSheetSize, number[]> = {
	fit: [0, 1],
	full: [0, 0.95],
	half: [0, 0.55],
	short: [0, 0.32],
};

const ACTIVE_MAP_BOTTOM_SHEET_HEIGHT_CSS_PROPERTY = '--active-map-bottom-sheet-height';

/* * */

export function BottomSheet({
	avoidKeyboard = true,
	children,
	disableDismiss = false,
	headerMode,
	initialSnap,
	mapAware = false,
	onClose,
	onCloseEnd,
	onOpenEnd,
	onOpenStart,
	opened,
	size = 'fit',
	snapPoints: customSnapPoints,
	title,
	withCloseButton = true,
	withCompactCloseButton = false,
	withHeaderBackground = false,
	withOverlay = true,
}: PropsWithChildren<BottomSheetProps>) {
	//

	//
	// A. Setup variables

	const titleId = useId();
	const sheetRef = useRef<SheetRef>(null);
	const { setActiveBottomSheetSnap } = useBottomSheet();
	const snapPoints = customSnapPoints ?? (mapAware ? MAP_BOTTOM_SHEET_SNAP_POINTS : SHEET_SNAP_POINTS_BY_SIZE[size]);
	const snapPointsKey = useMemo(() => snapPoints.join('|'), [snapPoints]);
	const detent = customSnapPoints || mapAware || size !== 'fit' ? 'full' : 'content';
	const selectedInitialSnap = initialSnap ?? (mapAware ? MAP_BOTTOM_SHEET_INITIAL_SNAP : snapPoints.length - 1);
	const selectedInitialSnapPoint = snapPoints[selectedInitialSnap] ?? null;
	const selectedHeaderMode = headerMode ?? (title ? 'default' : 'handle');
	const withTitle = selectedHeaderMode === 'default' && !!title;

	//
	// B. Handle actions

	useEffect(() => {
		if (!opened) {
			setActiveBottomSheetSnap({ snapIndex: null, snapPoint: null });
			return;
		}

		setActiveBottomSheetSnap({
			snapIndex: selectedInitialSnap,
			snapPoint: selectedInitialSnapPoint,
		});
		sheetRef.current?.snapTo(selectedInitialSnap);
	}, [opened, selectedInitialSnap, selectedInitialSnapPoint, setActiveBottomSheetSnap, snapPointsKey]);

	useEffect(() => {
		if (!mapAware || !opened) return;
		return registerActiveBottomSheetSnapController((snapIndex) => {
			setActiveBottomSheetSnap({
				snapIndex,
				snapPoint: snapPoints[snapIndex] ?? null,
			});
			sheetRef.current?.snapTo(snapIndex);
		});
	}, [mapAware, opened, setActiveBottomSheetSnap, snapPoints, snapPointsKey]);

	useEffect(() => {
		if (!mapAware || !opened || typeof document === 'undefined') return;

		const visibleHeight = sheetRef.current?.yInverted;
		if (!visibleHeight) return;

		const updateVisibleHeight = (value: number) => {
			document.documentElement.style.setProperty(
				ACTIVE_MAP_BOTTOM_SHEET_HEIGHT_CSS_PROPERTY,
				`${Math.max(0, Math.round(value))}px`,
			);
		};

		updateVisibleHeight(visibleHeight.get());
		const unsubscribe = visibleHeight.on('change', updateVisibleHeight);

		return () => {
			unsubscribe();
			document.documentElement.style.removeProperty(ACTIVE_MAP_BOTTOM_SHEET_HEIGHT_CSS_PROPERTY);
		};
	}, [mapAware, opened]);

	const handleSnap = (snapIndex: number) => {
		setActiveBottomSheetSnap({
			snapIndex,
			snapPoint: snapPoints[snapIndex] ?? null,
		});
	};

	//
	// C. Render components

	return (
		<Sheet
			ref={sheetRef}
			avoidKeyboard={avoidKeyboard}
			className={styles.root}
			detent={detent}
			disableDismiss={disableDismiss}
			initialSnap={selectedInitialSnap}
			isOpen={opened}
			onClose={onClose}
			onCloseEnd={onCloseEnd}
			onOpenEnd={onOpenEnd}
			onOpenStart={onOpenStart}
			onSnap={handleSnap}
			snapPoints={snapPoints}
		>
			<Sheet.Container
				aria-labelledby={withTitle ? titleId : undefined}
				aria-modal={true}
				className={styles.container}
				role="dialog"
			>
				<Sheet.Header
					className={styles.header}
					data-mode={selectedHeaderMode}
					data-with-background={withHeaderBackground}
				>
					<div className={styles.headerLeft} />

					{selectedHeaderMode === 'handle' ? (
						<div aria-hidden="true" className={styles.handle} />
					) : (
						<h1 className={styles.title} id={titleId}>
							{title ?? ''}
						</h1>
					)}

					<div className={styles.headerRight}>
						{withCloseButton && (
							<ReactModalSheetClose
								onClick={onClose}
								size={withCompactCloseButton ? 'sm' : 'default'}
							/>
						)}
					</div>
				</Sheet.Header>

				<Sheet.Content className={styles.content}>
					{children}
				</Sheet.Content>
			</Sheet.Container>

			{withOverlay && <Sheet.Backdrop className={styles.backdrop} onTap={onClose} />}
		</Sheet>
	);

	//
}
