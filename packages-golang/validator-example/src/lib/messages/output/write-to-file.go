package output

import (
	"encoding/json"
	"fmt"
	"os"

	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/messages"
)

// WriteToFile saves the report using the existing compact JSON file format.
func WriteToFile(filename string, summary types.Summary) error {
	//

	//
	// 1. Encode the complete report before opening the destination

	content, err := json.Marshal(summary)
	if err != nil {
		return fmt.Errorf("marshalling summary to JSON: %w", err)
	}

	//
	// 2. Write the report and propagate filesystem errors

	if err := os.WriteFile(filename, content, 0644); err != nil {
		return fmt.Errorf("writing summary to %s: %w", filename, err)
	}
	return nil
}
