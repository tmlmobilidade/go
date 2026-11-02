package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"strconv"
)

/*
# Attributes

  - File: frequencies.txt
  - Field: headway_secs
  - Presence: Required
  - Type: positive integer

# Description

Headway of service in seconds.

[frequencies.txt]: https://gtfs.org/schedule/reference/#frequenciestxt
*/
func HeadwaySecsValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "frequencies_headway_secs_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("headway_secs", "frequencies.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the headway_secs value

	value, err := db.Frequencies.Field("headway_secs")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty headway_secs values

	if value == "" {
		return nil
	}

	//
	// 5. Convert the headway_secs to an integer

	parsed, err := strconv.Atoi(value)

	//
	// 6. Check if the headway_secs is positive

	if err != nil || parsed <= 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 7. Return success

	return nil
}
