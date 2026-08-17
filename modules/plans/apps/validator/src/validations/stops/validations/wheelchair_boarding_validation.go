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
  - Field: wheelchair_boarding
  - Presence: Optional
  - Type: Enum

# Description

Indicates whether wheelchair boardings are possible from the location.

Valid options are:

For parentless stops:

  - 0 or empty - No accessibility information for the stop.
  - 1 - Some vehicles at this stop can be boarded by a rider in a wheelchair.
  - 2 - Wheelchair boarding is not possible at this stop.

For child stops:

  - 0 or empty - Stop will inherit its wheelchair_boarding behavior from the parent station, if specified in the parent.
  - 1 - There exists some accessible path from outside the station to the specific stop/platform.
  - 2 - There exists no accessible path from outside the station to the specific stop/platform.

For station entrances/exits:

  - 0 or empty - Station entrance will inherit its wheelchair_boarding behavior from the parent station, if specified for the parent.
  - 1 - Station entrance is wheelchair accessible.
  - 2 - No accessible path from station entrance to stops/platforms.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func WheelchairBoardingValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("wheelchair_boarding", "stops.txt", "wheelchair_boarding_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.WheelchairBoarding.Severity != "" {
		ctx.WithSeverity(rules.WheelchairBoarding.Severity)
	}

	// Validate presence
	if stop.WheelchairBoarding == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("wheelchair_boarding_validation.required", "wheelchair_boarding_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("wheelchair_boarding_validation.forbidden"))
		return
	}

	// Validate value
	validValues := []int{0, 1, 2}
	if !slices.Contains(validValues, *stop.WheelchairBoarding) {
		ctx.AddError(ctx.GetTranslatedMessage("wheelchair_boarding_validation.invalid", *stop.WheelchairBoarding))
		return
	}

	// Validate rules
	if rules != nil && rules.WheelchairBoarding.Options != nil {
		if slices.Contains(*rules.WheelchairBoarding.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.WheelchairBoarding.Options, strconv.Itoa(*stop.WheelchairBoarding)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("wheelchair_boarding_validation.not_allowed", *stop.WheelchairBoarding))
			return
		}
	}
}
