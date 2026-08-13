package types

// TripStopSequence holds min/max stop sequence for a trip
// Used for caching trip stop sequence information to avoid N+1 queries
type TripStopSequence struct {
	Min int
	Max int
}

// StopsDataRecord is a pre-rendered stop entry from stops_data.json.
type StopsDataRecord struct {
	Name      string          `json:"name"`
	Latitude  float64         `json:"latitude"`
	Longitude float64         `json:"longitude"`
	Flags     []StopsDataFlag `json:"flags"`
}
type StopsDataFlag struct {
	AgencyIDs    []string `json:"agency_ids"`
	IsHarmonized bool     `json:"is_harmonized"`
	ShortName    string   `json:"short_name"`
	StopID       string   `json:"stop_id"`
}

// StopsDataCache holds pre-rendered stops_data.json lookups for validations.
type StopsDataCache struct {
	ByStopID     map[string]StopsDataRecord
	ValidStopIDs map[string]struct{} // GTFS stop_ids from flags[].stop_id only
}
