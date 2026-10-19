package feed_info_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func FeedLangValid(db *services.SQLiteContext, rules *types.FeedInfoRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "feed_info_feed_lang_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("feed_lang", "feed_info.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the feed_lang value

	value, err := db.FeedInfo.Field("feed_lang")
	if err != nil {
		return err
	}

	//
	// 4. Check if the feed_lang is valid

	if !lib.ValidateLanguage(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}