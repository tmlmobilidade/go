package messages

import (
	"os"

	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/messages/output"
)

// OutputSummary writes the report to a file, or stdout when no path is provided.
// The caller handles logging and process exit when output fails.
func (service *MessageService) OutputSummary(outputPath string) error {
	//

	//
	// 1. Build one snapshot and write it to the selected destination

	summary := service.GetSummary()
	if outputPath != "" {
		return output.WriteToFile(outputPath, summary)
	}

	//
	// 2. Write the report and propagate filesystem errors

	return output.WriteJSON(os.Stdout, summary)
}
