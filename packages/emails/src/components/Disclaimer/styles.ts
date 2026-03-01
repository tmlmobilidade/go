/* * */

import { fontFamily, fontSize, fontWeight, lineHeight } from '@/styles/font.js';

/* * */
/* TEXT */

const text: React.CSSProperties = {
	color: '#BEBEC8',
	fontFamily: fontFamily.primary,
	fontSize: fontSize.xs,
	fontWeight: fontWeight.normal,
	lineHeight: lineHeight.normal,
	margin: 0,
	marginTop: '20px',
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
