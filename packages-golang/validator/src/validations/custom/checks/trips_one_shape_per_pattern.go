package custom

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
)

func OneShapePerPattern(db *services.SQLiteContext, rules *types.RuleContext, reported map[[2]string]bool) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_one_shape_per_pattern"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("shape_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Check if the shape_id validation should run

	if ctx.ShouldSkip() {
		return nil
	}

	//
	// 4. Get the pattern_id value

	pattern, err := db.Trips.Field("pattern_id")
	if err != nil {
		return err
	}

	//
	// 5. Collect the shapes associated with this pattern

	shapes := map[string]bool{}

	//
	// 6. Collect shape_id values for the pattern_id group

	err = validationutils.ForGroupFields(db, "pattern_id", []string{"shape_id"}, func(_ *services.SQLiteRow, fields map[string]string) error {
		value := fields["shape_id"]
		if value != "" {
			shapes[value] = true
		}
		return nil
	})
	if err != nil {
		return err
	}

	//
	// 7. Check if all trips in the pattern use the same shape_id

	if len(shapes) > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("different_shape_id", pattern))
		for shape := range shapes {
			reported[[2]string{pattern, shape}] = true
		}
	}

	//
	// 8. Return success

	return nil
}
