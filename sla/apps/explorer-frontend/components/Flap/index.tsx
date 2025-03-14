'use client';

/* * */

import { useEffect, useMemo, useRef, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface Props {
	char?: string
}

/* * */

export function Flap({ char }: Props) {
	//

	//
	// A. Setup variables

	const animationDuration = 200; // milliseconds

	const currChar = useRef(' ');
	const nextChar = useRef(' ');

	const [isFlipping, setIsFlipping] = useState(false);

	//
	// B. Handle actions

	const normalizedChar = useMemo(() => {
		// Transform char to remove diacritics, uppercase,
		// and only allow spaces, letters, numbers, dashes and parentheses
		return char
			?.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.toUpperCase()
			.replace(/[^A-Z0-9\s().:|-]/g, '') ?? ' ';
	}, [char]);

	const isAllowedChar = (code: number) => {
		if (code <= 31) return false;
		if (code >= 33 && code <= 39) return false;
		if (code >= 42 && code <= 44) return false;
		if (code === 47) return false;
		if (code >= 59 && code <= 64) return false;
		if (code >= 91 && code <= 123) return false;
		if (code >= 124) return false;
		return true;
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
		// Skip if already flipping
		if (isFlipping) return;
		// Skip if normalized char is the same
		if (currChar.current.charCodeAt(0) === normalizedChar.charCodeAt(0)) return;
		// Update char
		setIsFlipping(true);
		nextChar.current = incrementChar(currChar.current);
		setTimeout(() => {
			currChar.current = nextChar.current;
			nextChar.current = currChar.current;
			setIsFlipping(false);
		}, animationDuration); // Match CSS animation duration
	};

	useEffect(() => {
		const interval = setInterval(updateChar, animationDuration + 100);
		return () => clearInterval(interval);
	}, [char]);

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
