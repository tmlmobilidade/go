/* * */

import colors from '@/styles/colors.js';
import { fontFamily, fontSize, fontWeight } from '@/styles/font.js';

/* * */
/* TEXT */

const text: React.CSSProperties = {
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
