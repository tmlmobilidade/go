/* * */

import fm from 'front-matter';
import fs, { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import remarkHtml from 'remark-html';
import remarkParse from 'remark-parse';
import { fileURLToPath } from 'url';
// import { read } from 'to-vfile';
import { unified } from 'unified';

/* * */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const contentPath = resolve(__dirname, '../../content/');

interface ParsedMdxFile {
	html: string
	id: string
	subtitle?: string
	tags: string[]
	title: string
}

export async function transformMdxToHtml(): Promise<ParsedMdxFile[]> {
	const ParsedMdxFileComponents: ParsedMdxFile[] = [];

	const res = fs.readdirSync(contentPath);
	res.forEach(async (item) => {
		const fileData = fs.readFileSync(contentPath + '/' + item, 'utf-8');
		// const fileContent = fm.default<ParsedMdxFile>(fileData);

		console.log('------------------>>>', fileData);

		const contentHtml = await unified()
			.use(remarkParse)
			.use(remarkHtml)
			.process(fileData);
	});

	//
	// .... trasfrom frontmatter to json ....

	// .... trasfrom md to html ....
	// console.log('------------>', file.value);
	return ParsedMdxFileComponents;
	//
}
