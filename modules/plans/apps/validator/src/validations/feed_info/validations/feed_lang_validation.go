package feed_info

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [feed_info.txt]
- Field: feed_lang
- Presence: Required
- Type: Language Code

# Description

Default language used for the text in this dataset. This setting helps GTFS consumers choose capitalization rules and other language-specific settings for the dataset. The file translations.txt can be used if the text needs to be translated into languages other than the default one.

The default language may be multilingual for datasets with the original text in multiple languages. In such cases, the feed_lang field should contain the language code mul defined by the norm ISO 639-2, and a translation for each language used in the dataset should be provided in translations.txt. If all the original text in the dataset is in the same language, then mul should not be used.

# Example

Consider a dataset from a multilingual country like Switzerland, with the original stops.stop_name field populated with stop names in different languages. Each stop name is written according to the dominant language in that stop's geographic location, e.g. Genève for the French-speaking city of Geneva, Zürich for the German-speaking city of Zurich, and Biel/Bienne for the bilingual city of Biel/Bienne. The dataset feed_lang should be mul and translations would be provided in translations.txt, in German: Genf, Zürich and Biel; in French: Genève, Zurich and Bienne; in Italian: Ginevra, Zurigo and Bienna; and in English: Geneva, Zurich and Biel/Bienne.

[feed_info.txt]: https://gtfs.org/schedule/reference/#feed_infotxt
*/
func FeedLangValidation(feedInfo *types.FeedInfo, row int) {
	ctx := lib.NewValidationContext("feed_lang", "feed_info.txt", "feed_lang_valid_tag", row, services.AppMessageService)

	if feedInfo.FeedLang == nil || *feedInfo.FeedLang == "" {
		ctx.AddError(ctx.GetTranslatedMessage("feed_lang_validation.required"))
		return
	}

	if *feedInfo.FeedLang != "mul" {
		if valid := lib.ValidateLanguage(*feedInfo.FeedLang); !valid {
			ctx.AddError(ctx.GetTranslatedMessage("feed_lang_validation.invalid"))
			return
		}
	}
}
