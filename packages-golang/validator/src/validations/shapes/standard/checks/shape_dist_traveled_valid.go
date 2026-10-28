package shapes_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"math"
	"strconv"
)

func ShapeDistTraveledValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "shapes_shape_dist_traveled_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("shape_dist_traveled", "shapes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the shape_dist_traveled value

	value, err := db.Shapes.Field("shape_dist_traveled")
	if err != nil {
		return err
	}

	//
	// 4. Check if the shape_dist_traveled is valid

	number, parseErr := strconv.ParseFloat(value, 64)
	if parseErr != nil || number < 0 || math.IsNaN(number) || math.IsInf(number, 0) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
