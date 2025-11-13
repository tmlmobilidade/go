import React from 'react';

/* * */

const main: React.CSSProperties = {
	backgroundColor: '#F0F0F0',
	padding: '10px 0',
};

const container: React.CSSProperties = {
	backgroundColor: '#fff',
	border: '1px solid #E1E1E6',
	padding: '45px',
};

const text: React.CSSProperties = {
	color: '#000',
	fontFamily: '\'Open Sans\', \'Helvetica Neue\', Arial',
	fontSize: '16px',
	fontWeight: '400',
	lineHeight: '26px',
};

const footer_text: React.CSSProperties = {
	color: '#646482',
	fontFamily: '\'Open Sans\', \'Helvetica Neue\', Arial',
	fontSize: '12px',
	fontWeight: '300',
	lineHeight: '18px',
	textAlign: 'center',
};

const button: React.CSSProperties = {
	backgroundColor: '#ffdc00',
	borderRadius: '4px',
	boxShadow: '2px 2px 3px 0px rgba(0, 0, 0, 0.1)',
	color: '#000',
	display: 'block',
	fontFamily: '\'Open Sans\', \'Helvetica Neue\', Arial',
	fontSize: '15px',
	padding: '14px 7px',
	textAlign: 'center' as const,
	textDecoration: 'none',
	width: '210px',
};

// Enhanced color schemes for different contexts
const colors = {
	error: {
		background: '#FEF2F2',
		border: '#FECACA',
		text: '#DC2626',
	},
	info: {
		background: '#EFF6FF',
		border: '#BFDBFE',
		text: '#0369A1',
	},
	muted: {
		text: '#6B7280',
	},
	success: {
		background: '#F0FDF4',
		border: '#BBF7D0',
		text: '#16A34A',
	},
	warning: {
		background: '#FEF3C7',
		border: '#FCD34D',
		text: '#D97706',
	},
};

// Common text styles for different emphasis levels
const textStyles = {
	error: {
		...text,
		color: colors.error.text,
		fontWeight: '600',
	},
	highlight: {
		...text,
		fontWeight: '600',
	},
	info: {
		...text,
		color: colors.info.text,
		fontWeight: '600',
	},
	muted: {
		...text,
		color: colors.muted.text,
		fontSize: '14px',
	},
	small: {
		...text,
		fontSize: '14px',
	},
	success: {
		...text,
		color: colors.success.text,
		fontWeight: '600',
	},
	warning: {
		...text,
		color: colors.warning.text,
		fontWeight: '600',
	},
};

export default {
	button,
	colors,
	container,
	footer_text,
	main,
	text,
	textStyles,
};
