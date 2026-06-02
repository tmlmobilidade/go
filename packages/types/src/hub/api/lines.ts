/* * */

export interface HubLine {
	agency_id: string
	color: string
	district_ids: string[]
	facilities: string[]
	id: string
	locality_ids: string[]
	long_name: string
	municipality_ids: string[]
	pattern_ids: string[]
	region_ids: string[]
	route_ids: string[]
	short_name: string
	stop_ids: [] // This value isn't used at the moment
	text_color: string
	tts_name: string
}
