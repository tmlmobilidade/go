import { type PatternShapeMapItem } from '@tmlmobilidade/types';

export interface PatternShapeMapFeatureProperties extends Omit<PatternShapeMapItem, 'encoded_polyline'> {
	id: string
}

export interface PatternShapeMapInteractionState {
	features: PatternShapeMapFeatureProperties[]
	latitude: number
	longitude: number
}

export interface PatternShapeMapLineGroup {
	color: string
	line_code: string
	line_id: string
	line_name: string
	line_text_color: string
	patterns: PatternShapeMapFeatureProperties[]
}
