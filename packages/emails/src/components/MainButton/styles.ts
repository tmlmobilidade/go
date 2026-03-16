/* * */

import { fontFamily, fontSize, fontWeight } from '@/styles/font.js';
import { type CSSProperties } from 'react';

/* * */

const button: CSSProperties = {
	color: '#FFFFFF',
	display: 'block',
	fontFamily: fontFamily.primary,
	fontSize: fontSize.lg,
	fontWeight: fontWeight.bold,
	padding: 12,
	textAlign: 'center',
	textTransform: 'uppercase',
	width: '100%',
};

const section: CSSProperties = {
	backgroundColor: '#005ADC',
	borderColor: '#0041A0',
	borderRadius: 5,
	borderStyle: 'solid',
	borderWidth: 3,
	boxShadow: '0 1px 3px 0 #000A5040',
	boxSizing: 'border-box',
	textAlign: 'center',
	width: '100%',
};

const container: CSSProperties = {
	paddingBottom: 30,
	paddingTop: 10,
	textAlign: 'center',
	width: '100%',
};

/* * */

export default {
	button,
	container,
	section,
};
