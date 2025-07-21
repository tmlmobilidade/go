/* * */

import remarkHtml from 'remark-html';
import remarkParse from 'remark-parse';
import { read } from 'to-vfile';
import { unified } from 'unified';

/* * */

interface ParsedMdxFile {
	html: string
	id: string
	tags: string[]
	title: string
}

const filesBasePath = 'auth/apps/wiki-api/content';
const file = await unified()
	.use(remarkParse)
	.use(remarkHtml)
	.process(await read('content/home.mdx'));

export function transformMdxToHtml(): ParsedMdxFile {
	const mdxFilePath = filesBasePath + file.path;

	//
	// .... trasfrom frontmatter to json ....
	// .... trasfrom md to html ....
	console.log('------------>', mdxFilePath);
	return {
		html: '',
		id: '',
		tags: [],
		title: '',
	};

	//
}
