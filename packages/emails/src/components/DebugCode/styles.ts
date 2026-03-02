/* * */

import colors from '@/styles/colors.js';
import { fontFamily, fontSize, fontWeight } from '@/styles/font.js';
import { type CSSProperties } from 'react';

/* * */
/* TEXT */

const text: CSSProperties = {
	color: colors.muted.foreground,
	fontFamily: fontFamily.primary,
	fontSize: fontSize.xs,
	fontWeight: fontWeight.normal,
	margin: '0',
};

/* * */

export default {
	text,
};
