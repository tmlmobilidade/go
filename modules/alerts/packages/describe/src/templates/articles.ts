/* * */

export const templateArticlesReplacements = {

	/**
	 * Artigo definido feminino plural
	 * @example 'as' em Português, 'the' em Inglês
	 */
	def_f_p: { en: 'the', pt: 'as' },

	/**
	 * Artigo definido feminino singular
	 * @example 'a' em Português, 'the' em Inglês
	 */
	def_f_s: { en: 'the', pt: 'a' },

	/**
	 * Artigo definido masculino plural
	 * @example 'os' em Português, 'the' em Inglês
	 */
	def_m_p: { en: 'the', pt: 'os' },

	/**
	 * Artigo definido masculino singular
	 * @example 'o' em Português, 'the' em Inglês
	 */
	def_m_s: { en: 'the', pt: 'o' },

	/**
	 * Artigo indefinido feminino plural
	 * @example 'umas' em Português, 'some' em Inglês
	 */
	indef_f_p: { en: 'some', pt: 'umas' },

	/**
	 * Artigo indefinido feminino singular
	 * @example 'uma' em Português, 'a' em Inglês
	 */
	indef_f_s: { en: 'a', pt: 'uma' },

	/**
	 * Artigo indefinido masculino plural
	 * @example 'uns' em Português, 'some' em Inglês
	 */
	indef_m_p: { en: 'some', pt: 'uns' },

	/**
	 * Artigo indefinido masculino singular
	 * @example 'um' em Português, 'a' em Inglês
	 */
	indef_m_s: { en: 'a', pt: 'um' },

	/**
	 * Preposição com artigo definido feminino plural
	 * @example 'nas' em Português, 'in the' em Inglês
	 */
	in_def_f_p: { en: 'in the', pt: 'nas' },

	/**
	 * Preposição com artigo definido feminino singular
	 * @example 'na' em Português, 'in the' em Inglês
	 */
	in_def_f_s: { en: 'in the', pt: 'na' },

	/**
	 * Preposição com artigo definido masculino plural
	 * @example 'nos' em Português, 'in the' em Inglês
	 */
	in_def_m_p: { en: 'in the', pt: 'nos' },

	/**
	 * Preposição com artigo definido masculino singular
	 * @example 'no' em Português, 'in the' em Inglês
	 */
	in_def_m_s: { en: 'in the', pt: 'no' },

} as const satisfies Record<string, { en: string, pt: string }>;

/* * */

export type TemplateArticle = keyof typeof templateArticlesReplacements;
