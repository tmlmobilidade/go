/* * */

export interface PDFStatus {
	[key: string]: unknown
	downloadLink?: string
	status: string
}

export interface TokenResponse {
	access_token: string
	expires_in: number
}
