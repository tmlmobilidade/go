/* * */

import { fontFamily, fontSize, lineHeight } from '@/styles/font.js';
import { type CSSProperties } from 'react';

/* * */
/* TEXT */

const text: CSSProperties = {
	color: '#000000',
	fontFamily: fontFamily.primary,
	fontSize: fontSize.lg,
	lineHeight: lineHeight.normal,
	margin: '0',
	marginBottom: '15px',
	textAlign: 'left',
};

/* * */

export default {
	text,
};
