// rules-catalogue prints the shared TypeScript rule contract derived from the
// Go rule structs and catalogue. Use `npm run repo:validator-rules` from the
// repository root, which writes it to
// packages-new/types/gtfs-validator/src/rules/rules.generated.ts.
package main

import (
	"fmt"
	"main/lib/rules"
	"os"
)

func main() {
	output, err := rules.TypeScript()
	if err != nil {
		fmt.Fprintln(os.Stderr, "rules-catalogue:", err)
		os.Exit(1)
	}
	if _, err := os.Stdout.Write(output); err != nil {
		fmt.Fprintln(os.Stderr, "rules-catalogue:", err)
		os.Exit(1)
	}
}
