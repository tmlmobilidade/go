package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

func TripsShapeIdField(db *sqlite.SQLiteContext, ruleContext *rules.RuleContext, messageAdder messages.MessageAdder) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_shape_id_field"

	//
	// 2. Create the validation context

	ctx := context.NewValidationContext("shape_id", "trips.txt", ruleID, db.Row, messageAdder, ruleContext)

	//
	// 3. Get the shape_id value

	value, err := queries.Field(db.Trips, "shape_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the shape_id is required

	if value == "" {
		if context.ShouldIgnore(ctx) {
			return nil
		}

		context.AddMessage(ctx, context.GetSeverityMessage(ctx, "required", "recommended", "informational"))
		return nil
	}

	//
	// 5. Return success

	return nil
}
