package vehicles

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes
  - File: [vehicles.txt]
  - Field: typology
  - Presence: Required
  - Type: Enum

# Description

The typology of the vehicle.

Valid options are:

	- 0.1. - Light Rail (Type 1)
	- 0.2. - Light Rail (Type 2)
	- 0.3. - Light Rail (etc.)
	- 1.1. - Metro (Type 1)
	- 1.2. - Metro (Type 2)
	- 1.3. - Metro (etc.)
	- 2.1. - Rail (Type 1)
	- 2.2. - Rail (Type 2)
	- 2.3. - Rail (etc.)
	- 3.1. - Bus - Urban Mini
	- 3.2. - Bus - Urban Midi
	- 3.3. - Bus - Urban Standard
	- 3.4. - Bus - Urban Articulated
	- 3.5. - Bus - Inter-urban Standard
	- 3.6. - Bus - Inter-urban Articulated
	- 3.7. - Bus - Tourism
	- 4.1. - Ship (Type 1)
	- 4.2. - Ship (Type 2)
	- 4.3. - Ship (etc.)
	...
	- 7.1. - Funicular/Elevator (Type 1)
	- 7.2. - Funicular/Elevator (Type 2)
	- 7.3. - Funicular/Elevator (etc.)
*/

func TypologyValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("typology", "vehicles.txt", "typology_in_allowed_vehicle_types", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.Typology.Severity != "" {
		ctx.WithSeverity(rules.Typology.Severity)
	}

	if vehicle.Typology == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("typology_validation.required"))
		return
	}

	// validOptions := []string{"0.1", "0.2", "0.3", "1.1", "1.2", "1.3", "2.1", "2.2", "2.3", "3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "4.1", "4.2", "4.3", "7.1", "7.2", "7.3"}
	// if !slices.Contains(validOptions, *vehicle.Typology) {
	// 	ctx.AddError(ctx.GetTranslatedMessage("typology_validation.invalid", &vehicle.Typology))
	// 	return
	// }

	// Validate rules
	if rules != nil && rules.Typology.Options != nil {
		if slices.Contains(*rules.Typology.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.Typology.Options, *vehicle.Typology) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("typology_validation.not_allowed", *vehicle.Typology))
			return
		}
	}
}
