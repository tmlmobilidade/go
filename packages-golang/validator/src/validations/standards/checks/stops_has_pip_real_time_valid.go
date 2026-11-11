package standard

import (
	"slices"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: has_pip_real_time
  - Presence: Configurable
  - Type: Enum

# Description

TML extension recording the presence or status of real-time passenger information display at the stop.

This field is not defined by GTFS Standard and has no published presence requirement. Its presence is controlled by
the validation rule configuration.

Validation: Checks that the populated value exactly matches one of 0, 1, 2. Whitespace and letter case are
preserved. Configured value lists are not applied. Empty values are skipped; required-field checks handle absence.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func HasPipRealTimeValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"has_pip_real_time"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "has_pip_real_time")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the has_pip_real_time is valid

		validValues := []string{"0", "1", "2"}
		if !slices.Contains(validValues, value) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
