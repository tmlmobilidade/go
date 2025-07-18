/* * */

interface ParsedMdxFile {
	html: string
	id: string
	tags: string[]
	title: string
}

export function transformMdxToHtml(mdxFilePath: string): ParsedMdxFile {
	//

	// .... trasfrom mdx to html ....

	return {
		html: '',
		id: '',
		tags: [],
		title: '',
	};

	//
}
