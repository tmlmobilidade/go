'use client';

/* * */

import { useFlapsContext } from '@/contexts/Flaps.context';
import { normalizeChar } from '@/utils/normalize-char';
import { useEffect, useMemo, useRef, useState } from 'react';

import styles from './styles.module.css';

/* * */

export const CHARACTER_SETS = {
	alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ',
	numeric: '0123456789',
	special: '()-|.',
	time: '0123456789:',
};

/* * */
interface Props {
	char?: string
	characterSets?: (keyof typeof CHARACTER_SETS)[]
}

/* * */

export function Flap({ char = ' ', characterSets = ['alphabet', 'numeric', 'special'] }: Props) {
	//

	//
	// A. Setup variables

	const currChar = useRef(normalizeChar(char));
	const nextChar = useRef(normalizeChar(char));

	const [isFlipping, setIsFlipping] = useState(false);

	const flapsContext = useFlapsContext();

	//
	// B. Transform data

	const normalizedChar = useMemo(() => {
		return normalizeChar(char);
	}, [char]);

	//
	// C. Handle actions

	const isAllowedChar = (code: number): boolean => {
		// Check if code is in any of the allowed character sets
		return characterSets.some(set => CHARACTER_SETS[set].includes(String.fromCharCode(code)));
	};

	const incrementChar = (c: string) => {
		let code = c.charCodeAt(0) + 1;
		// If code is out of bounds, reset to 0
		// If code is of forbidden char, increment again
		while (!isAllowedChar(code)) {
			code++;
			if (code >= 126) code = 0;
		}
		return String.fromCharCode(code);
	};

	const updateChar = () => {
		setIsFlipping(true);
		nextChar.current = incrementChar(currChar.current);

		let startTime: null | number = null;
		let frameId: number;

		const animateFlip = (timestamp: number) => {
			if (!startTime) startTime = timestamp;

			const elapsed = timestamp - startTime;

			if (elapsed >= flapsContext.constants.animation_duration) {
				currChar.current = nextChar.current;
				nextChar.current = currChar.current;
				setIsFlipping(false);
				cancelAnimationFrame(frameId);
			}
			else {
				frameId = requestAnimationFrame(animateFlip);
			}
		};

		frameId = requestAnimationFrame(animateFlip);
	};

	useEffect(() => {
		// Skip if already flipping
		if (isFlipping) return;
		// Skip if normalized char is the same
		if (currChar.current.charCodeAt(0) === normalizedChar.charCodeAt(0)) return;
		// Update char
		updateChar();
		//
	}, [flapsContext.data.tick]);

	//
	// C. Render components

	if (isFlipping) {
		return (
			<div className={styles.container}>
				<span className={styles.topHalf}>{nextChar.current}</span>
				<span className={`${styles.topHalf} ${styles.flipOne}`}>{currChar.current}</span>
				<span className={styles.hinge} />
				<span className={styles.bottomHalf}>{currChar.current}</span>
				<span className={`${styles.bottomHalf} ${styles.flipTwo}`}>{nextChar.current}</span>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<span className={styles.topHalf}>{nextChar.current}</span>
			<span className={styles.hinge} />
			<span className={styles.bottomHalf}>{nextChar.current}</span>
		</div>
	);

	//
}
