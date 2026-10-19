/** Serialized SDK request. Headers and payload must be forwarded together without re-encoding. */
export interface AnalyticsReplayUpload {
	body: string | Uint8Array
	headers: Record<string, string>
	keepalive: boolean
	method: 'POST'
	url: string
}
