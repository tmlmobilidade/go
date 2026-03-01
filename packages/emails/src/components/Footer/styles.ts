/* * */

import { fontFamily, fontSize, fontWeight, lineHeight } from '@/styles/font.js';

/* * */
/* TEXT */

const text: React.CSSProperties = {
	color: '#BEBEC8',
	fontFamily: fontFamily.primary,
	fontSize: fontSize.xs,
	fontWeight: fontWeight.normal,
	lineHeight: lineHeight.primary,
	margin: 0,
	padding: '30px',
	textAlign: 'left',
};

/* * */
/* LINK */

const link: React.CSSProperties = {
	color: '#BEBEC8',
	textDecoration: 'underline',
};

/* * */

export default {
	link,
	text,
};
