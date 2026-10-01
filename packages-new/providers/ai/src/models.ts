/* * */

export interface AiModel {
	ocid: string
	release_date: string
}

/**
 * Available AI models for the AI provider.
 */
export const availableAiModels = {

	'cohere.command-a-03-2025 v1.0': {
		ocid: 'ocid1.generativeaimodel.oc1.eu-frankfurt-1.amaaaaaask7dceyaaypm2hg4db3evqkmjfdli5mggcxrhp2i4qmhvggyb4ja',
		release_date: '2025-03-01',
	},

	'google.gemini-2.5-flash': {
		ocid: 'ocid1.generativeaimodel.oc1.eu-frankfurt-1.amaaaaaask7dceyacn5rezarysrnds7bjsu6iy5nrxdvq6hyqcygode5o5xq',
		release_date: '2025-03-01',
	},

	'google.gemini-2.5-pro': {
		ocid: 'ocid1.generativeaimodel.oc1.eu-frankfurt-1.amaaaaaask7dceyan6gecfjovk7wtgl3r65b5tmpuegfxojbp2mebjgtvhra',
		release_date: '2025-03-01',
	},

} as const satisfies Record<string, AiModel>;
