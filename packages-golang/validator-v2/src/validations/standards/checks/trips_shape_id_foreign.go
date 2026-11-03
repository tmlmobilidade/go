package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

func ShapeIdForeign(db *sqlite.SQLiteContext, ruleContext *rules.RuleContext, messageAdder messages.MessageAdder) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_shape_id_foreign"

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
	// 4. Requiredness is checked by the field rule.

	if value == "" {
		return nil
	}

	//
	// 5. Check if the shape_id exists in the shapes table

	exists, err := queries.Exists(db.Shapes.Table, "shape_id", value)
	if err != nil {
		return err
	}
	if !exists {
		context.AddMessage(ctx, context.GetTranslatedMessage(ctx, "not_found", value))
	}

	//
	// 6. Return success

	return nil
}
