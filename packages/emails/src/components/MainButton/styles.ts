/* * */

import { fontFamily, fontSize, fontWeight } from '@/styles/font.js';
import { type CSSProperties } from 'react';

/* * */
/* IMAGE */

const button: CSSProperties = {
	backgroundColor: '#005ADC',
	border: '3px solid #0041A0',
	borderRadius: '5px',
	boxShadow: '0 1px 3px 0 #000A5040',
	color: '#FFFFFF',
	fontFamily: fontFamily.primary,
	fontSize: fontSize.lg,
	fontWeight: fontWeight.bold,
	marginBottom: '30px',
	marginTop: '10px',
	padding: '12px 0',
	textAlign: 'center',
	textTransform: 'uppercase',
	width: '100%',
};

/* * */

export default {
	button,
};
