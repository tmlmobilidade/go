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
  - Field: has_bench
  - Presence: Optional
  - Type: Enum

# Description

Describes if the stop has a bench.

- 0 - Not Applicable for this stop
- 1 - Stop has no bench
- 2 - Has bench but is in bad condition
- 3 - Has bench and is in good condition

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func HasBenchValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("has_bench", "stops.txt", "has_bench_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.HasBench.Severity != "" {
		ctx.WithSeverity(rules.HasBench.Severity)
	}

	if stop.HasBench == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("has_bench_validation.required", "has_bench_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("has_bench_validation.forbidden"))
		return
	}

	// Validate value
	validValues := []int{0, 1, 2, 3}
	if !slices.Contains(validValues, *stop.HasBench) {
		ctx.AddError(ctx.GetTranslatedMessage("has_bench_validation.invalid", *stop.HasBench))
		return
	}

	// Validate Rule options
	if rules != nil && rules.HasBench.Options != nil {
		if slices.Contains(*rules.HasBench.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.HasBench.Options, strconv.Itoa(*stop.HasBench)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("has_bench_validation.not_allowed", *stop.HasBench))
		}

		return
	}
}
