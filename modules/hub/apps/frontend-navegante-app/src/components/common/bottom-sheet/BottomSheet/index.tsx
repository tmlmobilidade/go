'use client';

/* * */

import { BottomSheetBack } from '@/components/common/bottom-sheet/BottomSheetBack';
import { BottomSheetClose } from '@/components/common/bottom-sheet/BottomSheetClose';
import { ACTIVE_MAP_BOTTOM_SHEET_HEIGHT_CSS_PROPERTY, MAP_BOTTOM_SHEET_INITIAL_SNAP, MAP_BOTTOM_SHEET_SNAP_POINTS } from '@/constants/bottom-sheet';
import { registerActiveBottomSheetSnapController, useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { getBottomSheetSnapState, shouldShowBottomSheetOverlay } from '@/utils/bottom-sheet/behavior';
import { type PropsWithChildren, type ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Sheet, type SheetRef } from 'react-modal-sheet';

import styles from './styles.module.css';

/* * */

type BottomSheetHeaderMode = 'default' | 'handle';
type BottomSheetLayer = 'default' | 'foreground';
type BottomSheetSize = 'fit' | 'full' | 'half' | 'short';

interface BottomSheetProps {
	avoidKeyboard?: boolean
	disableDismiss?: boolean
	footer?: ReactNode
	headerMode?: BottomSheetHeaderMode
	initialSnap?: number
	layer?: BottomSheetLayer
	mapAware?: boolean
	onBack?: () => void
	onClose: () => void
	onCloseEnd?: () => void
	onOpenEnd?: () => void
	onOpenStart?: () => void
	opened: boolean
	size?: BottomSheetSize
	snapPoints?: number[]
	syncSnapState?: boolean
	title?: string
	withCloseButton?: boolean
	withCompactCloseButton?: boolean
	withHeaderBackground?: boolean
	withOverlay?: boolean
}

/* * */

const SHEET_SNAP_POINTS_BY_SIZE: Record<BottomSheetSize, number[]> = {
	fit: [0, 1],
	full: [0, 1],
	half: [0, 0.55, 1],
	short: [0, 0.32, 1],
};

const SHEET_INITIAL_SNAP_BY_SIZE: Record<BottomSheetSize, number> = {
	fit: 1,
	full: 1,
	half: 1,
	short: 1,
};

/* * */

export function BottomSheet({
	avoidKeyboard = true,
	children,
	disableDismiss = false,
	footer,
	headerMode,
	initialSnap,
	layer = 'default',
	mapAware = false,
	onBack,
	onClose,
	onCloseEnd,
	onOpenEnd,
	onOpenStart,
	opened,
	size = 'fit',
	snapPoints: customSnapPoints,
	syncSnapState = true,
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
	const isSheetOpenRef = useRef(false);
	const sheetRef = useRef<SheetRef>(null);
	const { setActiveBottomSheetSnap } = useBottomSheet();
	const snapPoints = customSnapPoints ?? (mapAware ? MAP_BOTTOM_SHEET_SNAP_POINTS : SHEET_SNAP_POINTS_BY_SIZE[size]);
	const snapPointsKey = useMemo(() => snapPoints.join('|'), [snapPoints]);
	const detent = customSnapPoints || mapAware || size !== 'fit' ? 'full' : 'content';
	const selectedInitialSnap = initialSnap ?? (mapAware
		? MAP_BOTTOM_SHEET_INITIAL_SNAP
		: customSnapPoints
			? snapPoints.length - 1
			: SHEET_INITIAL_SNAP_BY_SIZE[size]);
	const selectedInitialSnapPoint = snapPoints[selectedInitialSnap] ?? null;
	const selectedHeaderMode = headerMode ?? (title ? 'default' : 'handle');
	const withTitle = selectedHeaderMode === 'default' && !!title;
	const [activeSnapIndex, setActiveSnapIndex] = useState(selectedInitialSnap);
	const showOverlay = shouldShowBottomSheetOverlay({
		snapIndex: activeSnapIndex,
		snapPoints,
		withOverlay,
	});

	//
	// B. Handle actions

	useEffect(() => {
		if (!opened) {
			if (syncSnapState) setActiveBottomSheetSnap({ snapIndex: null, snapPoint: null });
			return;
		}

		setActiveSnapIndex(selectedInitialSnap);

		let animationFrameId: number | undefined;
		if (isSheetOpenRef.current) {
			animationFrameId = window.requestAnimationFrame(() => {
				const sheet = sheetRef.current;
				if (!sheet || sheet.snapPoints.length <= selectedInitialSnap) return;
				void sheet.snapTo(selectedInitialSnap);
			});
		}

		if (syncSnapState) {
			setActiveBottomSheetSnap({
				snapIndex: selectedInitialSnap,
				snapPoint: selectedInitialSnapPoint,
			});
		}

		return () => {
			if (animationFrameId !== undefined) window.cancelAnimationFrame(animationFrameId);
		};
	}, [opened, selectedInitialSnap, selectedInitialSnapPoint, setActiveBottomSheetSnap, snapPointsKey, syncSnapState]);

	useEffect(() => {
		if (!syncSnapState || !mapAware || !opened) return;
		return registerActiveBottomSheetSnapController((snapIndex) => {
			setActiveBottomSheetSnap(getBottomSheetSnapState(snapPoints, snapIndex));
			const sheet = sheetRef.current;
			if (!sheet || sheet.snapPoints.length <= snapIndex) return;
			void sheet.snapTo(snapIndex);
		});
	}, [mapAware, opened, setActiveBottomSheetSnap, snapPoints, snapPointsKey, syncSnapState]);

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
		setActiveSnapIndex(snapIndex);
		if (!syncSnapState) return;
		setActiveBottomSheetSnap(getBottomSheetSnapState(snapPoints, snapIndex));
	};

	const handleCloseEnd = () => {
		isSheetOpenRef.current = false;
		setActiveSnapIndex(selectedInitialSnap);
		onCloseEnd?.();
	};

	const handleOpenEnd = () => {
		isSheetOpenRef.current = true;
		onOpenEnd?.();
	};

	const handleOpenStart = () => {
		isSheetOpenRef.current = false;
		onOpenStart?.();
	};

	//
	// C. Render components

	return (
		<Sheet
			ref={sheetRef}
			avoidKeyboard={avoidKeyboard}
			className={styles.root}
			data-layer={layer}
			data-with-overlay={showOverlay}
			detent={detent}
			disableDismiss={disableDismiss}
			initialSnap={selectedInitialSnap}
			isOpen={opened}
			onClose={onClose}
			onCloseEnd={handleCloseEnd}
			onOpenEnd={handleOpenEnd}
			onOpenStart={handleOpenStart}
			onSnap={handleSnap}
			snapPoints={snapPoints}
		>
			<Sheet.Container
				aria-labelledby={withTitle ? titleId : undefined}
				aria-modal={true}
				className={styles.container}
				data-detent={detent}
				role="dialog"
			>
				<Sheet.Header
					className={styles.header}
					data-mode={selectedHeaderMode}
					data-with-background={withHeaderBackground}
				>
					<div className={styles.headerLeft}>
						{onBack && <BottomSheetBack onClick={onBack} />}
					</div>

					{selectedHeaderMode === 'handle' ? (
						<div aria-hidden="true" className={styles.handle} />
					) : (
						<h1 className={styles.title} id={titleId}>
							{title ?? ''}
						</h1>
					)}

					<div className={styles.headerRight}>
						{withCloseButton && (
							<BottomSheetClose
								onClick={onClose}
								size={withCompactCloseButton ? 'sm' : 'default'}
							/>
						)}
					</div>
				</Sheet.Header>

				<Sheet.Content
					className={styles.content}
					disableScroll={({ currentSnap }) => mapAware && currentSnap !== snapPoints.length - 1}
				>
					{children}
				</Sheet.Content>

				{footer && <div className={styles.footer}>{footer}</div>}
			</Sheet.Container>

			{showOverlay && <Sheet.Backdrop className={styles.backdrop} onTap={onClose} />}
		</Sheet>
	);

	//
}
