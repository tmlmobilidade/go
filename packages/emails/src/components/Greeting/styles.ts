/* * */

import { fontFamily, fontSize, fontWeight } from '@/styles/font.js';
import { type CSSProperties } from 'react';

/* * */
/* TEXT */

const text: CSSProperties = {
	color: '#000',
	fontFamily: fontFamily.primary,
	fontSize: fontSize.lg,
	fontWeight: fontWeight.bold,
	margin: '0',
	marginBottom: '20px',
	textAlign: 'left',
};

/* * */

export default {
	text,
};
