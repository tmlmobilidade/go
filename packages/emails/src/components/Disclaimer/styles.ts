/* * */

import { fontFamily, fontSize, fontWeight, lineHeight } from '@/styles/font.js';
import { type CSSProperties } from 'react';

/* * */
/* TEXT */

const text: CSSProperties = {
	color: '#BEBEC8',
	fontFamily: fontFamily.primary,
	fontSize: fontSize.xs,
	fontWeight: fontWeight.normal,
	lineHeight: lineHeight.normal,
};

const section: CSSProperties = {
	fontFamily: fontFamily.primary,
	fontSize: fontSize.xs,
	fontWeight: fontWeight.normal,
	lineHeight: lineHeight.normal,
	padding: '30px',
	paddingTop: 0,
};

/* * */
/* LINK */

const link: CSSProperties = {
	color: '#BEBEC8',
	textDecoration: 'underline',
};

/* * */

export default {
	link,
	section,
	text,
};
