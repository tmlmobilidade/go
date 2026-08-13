package stops

import (
	"encoding/json"
	"fmt"
	"main/lib"
	"main/services"
	"main/types"
	"os"
)

type StopsDataEntry struct {
	Name      string                `json:"name"`
	Latitude  float64               `json:"latitude"`
	Longitude float64               `json:"longitude"`
	Flags     []types.StopsDataFlag `json:"flags"`
}

// BuildStopsDataCache loads stops_data.json from the CLI -stops path and indexes stop_id values from flags.
func BuildStopsDataCache() *types.StopsDataCache {
	empty := &types.StopsDataCache{
		ByStopID:     make(map[string]types.StopsDataRecord),
		ValidStopIDs: make(map[string]struct{}),
	}

	stopsPath := services.AppCLI.Options.StopsPath
	if stopsPath == "" {
		return empty
	}

	lib.AppLogger.Debug("Pre-computing stops_data cache...")

	fileBytes, err := os.ReadFile(stopsPath)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error reading stops_data.json: %v", err))
		return empty
	}
	lib.AppLogger.Debug(fmt.Sprintf("Loaded stops_data.json from %s", stopsPath))

	var entries []StopsDataEntry
	if err := json.Unmarshal(fileBytes, &entries); err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error parsing stops_data.json: %v", err))
		return empty
	}

	cache := &types.StopsDataCache{
		ByStopID:     make(map[string]types.StopsDataRecord),
		ValidStopIDs: make(map[string]struct{}),
	}

	for _, entry := range entries {
		for _, flag := range entry.Flags {
			if flag.StopID != "" {
				cache.ValidStopIDs[flag.StopID] = struct{}{}
				if _, exists := cache.ByStopID[flag.StopID]; !exists {
					cache.ByStopID[flag.StopID] = types.StopsDataRecord{
						Name:      entry.Name,
						Latitude:  entry.Latitude,
						Longitude: entry.Longitude,
						Flags: []types.StopsDataFlag{
							{
								AgencyIDs:    flag.AgencyIDs,
								IsHarmonized: flag.IsHarmonized,
								ShortName:    flag.ShortName,
								StopID:       flag.StopID,
							},
						},
					}
				}
			}
		}
	}

	lib.AppLogger.Debug(fmt.Sprintf("Pre-computed stops_data cache for %d stops", len(cache.ByStopID)))
	return cache
}
