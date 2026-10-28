package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"strconv"
)

func ShapePtLonValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "shapes_shape_pt_lon_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("shape_pt_lon", "shapes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the shape_pt_lon value

	value, err := db.Shapes.Field("shape_pt_lon")
	if err != nil {
		return err
	}

	//
	// 4. Transform the value to a float

	number, parseErr := strconv.ParseFloat(value, 64)
	if parseErr != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Check if the shape_pt_lon is valid

	if !lib.ValidateLongitude(number) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 6. Return success

	return nil
}
