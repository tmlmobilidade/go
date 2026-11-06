package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestLevelsLevelName(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "levels_level_name_field",
		table: "levels",
		field: "level_name",
		run:   standard.LevelNameField,
	})
}
