package stops

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: has_network_map
  - Presence: Optional
  - Type: Enum

# Description

Describes if the stop has a network map.

- 0 - Not Applicable for this stop
- 1 - Stop has no network map
- 2 - Has network map but is in bad condition
- 3 - Has network map and is in good condition

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func HasNetworkMapValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("has_network_map", "stops.txt", "stops_has_network_map_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.HasNetworkMap.Severity != "" {
		ctx.WithSeverity(rules.HasNetworkMap.Severity)
	}

	// 1. Validate has_network_map is present
	if stop.HasNetworkMap == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("has_network_map_validation.required", "has_network_map_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate has_network_map is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("has_network_map_validation.forbidden"))
		return
	}

	// 3. Validate has_network_map is a valid value
	validValues := []int{0, 1, 2, 3}
	if !slices.Contains(validValues, *stop.HasNetworkMap) {
		ctx.AddError(ctx.GetTranslatedMessage("has_network_map_validation.invalid", *stop.HasNetworkMap))
		return
	}

	// 4. Validate Rule options
	if rules != nil && rules.HasNetworkMap.Options != nil {
		if slices.Contains(*rules.HasNetworkMap.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.HasNetworkMap.Options, strconv.Itoa(*stop.HasNetworkMap)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("has_network_map_validation.not_allowed", *stop.HasNetworkMap))
			return
		}
	}
}
