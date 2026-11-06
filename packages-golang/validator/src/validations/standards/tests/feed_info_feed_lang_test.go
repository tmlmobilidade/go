package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestFeedInfoFeedLang(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "feed_info_feed_lang_field",
		table: "feed_info",
		field: "feed_lang",
		run:   standard.FeedLangField,
	})
}
