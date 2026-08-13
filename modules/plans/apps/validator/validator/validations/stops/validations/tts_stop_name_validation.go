package stops

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: tts_stop_name
  - Presence: Optional
  - Type: String

# Description

Readable version of the stop_name. See "Text-to-speech field" in the [Term Definitions] for more.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
[Term Definitions]: https://gtfs.org/schedule/reference/#term-definitions
*/
func TtsStopNameValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("tts_stop_name", "stops.txt", "tts_stop_name_valid", row, services.AppMessageService)
	if rules != nil && rules.TtsStopName.Severity != "" {
		ctx.WithSeverity(rules.TtsStopName.Severity)
	}

	if stop.TtsStopName == nil || *stop.TtsStopName == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("tts_stop_name_validation.required", "tts_stop_name_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("tts_stop_name_validation.forbidden"))
		return
	}

	// Validate rules
	if rules != nil && rules.TtsStopName.Options != nil {
		if slices.Contains(*rules.TtsStopName.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.TtsStopName.Options, *stop.TtsStopName) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("tts_stop_name_validation.not_allowed", *stop.TtsStopName))
			return
		}
	}
}
