package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestLevelsLevelIndex(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "levels_level_index_field",
		table: "levels",
		field: "level_index",
		run:   standard.LevelIndexField,
	})
}
