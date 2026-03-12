/* * */

import { type CSSProperties } from 'react';

/* * */
/* BODY */

const body: CSSProperties = {
	backgroundColor: '#FFFFFF',
	margin: '0 auto',
	padding: 0,
};

/* * */
/* CONTAINER */

const container: CSSProperties = {
	backgroundColor: '#F6F8FA',
	// display: 'flex',
	// flexDirection: 'column',
	maxWidth: '600px',
	width: '100%',
};

/* * */
/* CONTENT */

const content: CSSProperties = {
	// display: 'flex',
	// flexDirection: 'column',
	padding: '30px',
	paddingBottom: '10px',
	paddingTop: '10px',
	width: '100%',
};

/* * */

export default {
	body,
	container,
	content,
};
