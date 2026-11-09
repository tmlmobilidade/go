package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	variables "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
	"slices"
	"strconv"
)

/*
# Attributes

  - File: frequencies.txt
  - Field: exact_times
  - Presence: optional
  - Type: enum

# Description

Indicates whether the headway between vehicles is exactly regular (i.e., there are no variations in headway).

Valid options are:

  - 0 or empty - Frequency-based trips.
  - 1 - Schedule-based trips with the exact same headway throughout the day. In this case the end_time value must be greater than the last desired trip start_time but less than the last desired trip start_time + headway_secs.

[frequencies.txt]: https://gtfs.org/schedule/reference/#frequenciestxt
*/
func ExactTimesValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "frequencies", []string{"exact_times"}, func(rowCtx *context.ValidationContext) error {
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
