package feed_info_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func FeedContactEmailValid(db *services.SQLiteContext, rules *types.FeedInfoRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "feed_info_feed_contact_email_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("feed_contact_email", "feed_info.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the feed_contact_email value

	value, err := db.FeedInfo.Field("feed_contact_email")
	if err != nil {
		return err
	}

	//
	// 4. Check if the feed_contact_email is valid

	if !lib.ValidateEmail(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}