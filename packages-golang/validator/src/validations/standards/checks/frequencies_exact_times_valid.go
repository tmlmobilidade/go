package standard

import (
	"slices"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	variables "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

/*
# Attributes

  - File: [frequencies.txt]
  - Field: exact_times
  - Presence: Optional
  - Type: Enum

# Description

Specifies frequency-based service with 0 or an empty value, or exact scheduled departures at a fixed headway with
1. For exact service, end_time is after the last departure and before that departure plus headway_secs.

Validation: Checks that the populated value represents an integer in 0, 1. Matching uses the parsed integer rather
than its original spelling. Configured options can further restrict this set; all_options bypasses that
restriction, while an empty list rejects all populated values. Empty values are skipped; required-field checks
handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[frequencies.txt]: https://gtfs.org/documentation/schedule/reference/#frequenciestxt
*/
func ExactTimesValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "frequencies", []string{"exact_times"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}
		config := &rowCtx.Config

		value, err := queries.Field(rowCtx.Source, "exact_times")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty exact_times values

		if value == "" {
			return nil
		}

		//
		// 3. Convert the exact_times to an integer

		parsed, err := strconv.Atoi(value)

		//
		// 4. Check if the exact_times is a valid option

		if err != nil || !slices.Contains([]int{0, 1}, parsed) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 5. Check the configured exact_times options

		if config.Options != nil && !slices.Contains(*config.Options, variables.AllRuleOptions) && !slices.Contains(*config.Options, strconv.Itoa(parsed)) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_allowed", strconv.Itoa(parsed)))
		}

		//
		// 6. Return success

		return nil
	})
}
