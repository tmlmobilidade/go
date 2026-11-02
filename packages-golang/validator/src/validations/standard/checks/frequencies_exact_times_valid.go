package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
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
func ExactTimesValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "frequencies_exact_times_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("exact_times", "frequencies.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the exact_times value

	value, err := db.Frequencies.Field("exact_times")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty exact_times values

	if value == "" {
		return nil
	}

	//
	// 5. Convert the exact_times to an integer

	parsed, err := strconv.Atoi(value)

	//
	// 6. Check if the exact_times is a valid option

	if err != nil || !slices.Contains([]int{0, 1}, parsed) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 7. Check the configured exact_times options

	if rules != nil && rules.Options != nil && !slices.Contains(*rules.Options, types.ALL_OPTIONS) && !slices.Contains(*rules.Options, strconv.Itoa(parsed)) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", strconv.Itoa(parsed)))
	}

	//
	// 8. Return success

	return nil
}
