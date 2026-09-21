package trips

import (
	"main/lib"
	"main/services"
	"main/types"
	"sort"
	"strings"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: trip_headsign
  - Presence: Optional (Required for "Transportes Metropolitanos de Lisboa" when pattern_id is set)
  - Type: Text

# Description

1) All trips with the same pattern_id must have the same trip_headsign
   (including consistent presence: nil/empty vs non-empty).
*/

func tripHeadsignKey(trip types.Trip) string {
	if trip.TripHeadsign != nil {
		return *trip.TripHeadsign
	}
	return ""
}

func TripHeadsignGroupValidation(tripsGroupedByPattern types.TripGroupedByPattern, gtfs *types.Gtfs, rules *types.TripsRules) {

	// 1) All trips with the same pattern_id must have the same trip_headsign
	for patternId, group := range tripsGroupedByPattern {
		if len(group.Trips) == 0 {
			panic("trips is empty")
		}

		headsigns := make(map[string]bool)
		for _, trip := range group.Trips {
			headsigns[tripHeadsignKey(trip)] = true
		}

		if len(headsigns) <= 1 {
			continue
		}

		keys := make([]string, 0, len(headsigns))
		for h := range headsigns {
			keys = append(keys, h)
		}
		sort.Strings(keys)
		parts := make([]string, len(keys))
		for i, h := range keys {
			if h == "" {
				parts[i] = "[empty]"
			} else {
				parts[i] = h
			}
		}
		row := group.Trips[0].Row
		ctx := lib.NewValidationContext("trip_headsign", "trips.txt", "trip_headsign_consistent_for_all_patterns_in_trips", row, services.AppMessageService)
		if rules != nil && rules.TripHeadsignGroup.Severity != "" {
			ctx.WithSeverity(rules.TripHeadsignGroup.Severity)
		}
		if ctx.ShouldSkip() {
			return
		}
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("trip_headsign_group_validation.different_headsigns_in_pattern", patternId, strings.Join(parts, ", ")))
	}
}
