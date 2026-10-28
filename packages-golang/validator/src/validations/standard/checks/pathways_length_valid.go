package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"strconv"
)

/*
# Attributes

- File: [pathways.txt]
- Field: length
- Presence: optional
- Type: non-negative float

# Description

Horizontal length in meters of the pathway from the origin location (defined in from_stop_id) to the destination location (defined in to_stop_id).

This field is recommended for walkways (pathway_mode=1), fare gates (pathway_mode=6) and exit gates (pathway_mode=7).

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func LengthValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "pathways_length_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("length", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the length value

	value, err := db.Pathways.Field("length")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty length values

	if value == "" {
		return nil
	}

	//
	// 5. Convert the length to a float

	parsed, err := strconv.ParseFloat(value, 32)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 6. Check if the length is non-negative

	if parsed < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("negative", float32(parsed)))
	}

	//
	// 7. Return success

	return nil
}
