/** A server-owned activation with local clock deadlines used only to stop capture. */
export interface AnalyticsReplayActivation {
	activationId: string
	deadline: number
	expiresAt: number
	monotonicDeadline: number
}
