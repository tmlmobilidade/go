package importgtfs

/* * */

import (
	"archive/zip"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
)

/* * */

// Returns a local ZIP path and a cleanup function.
// Local files belong to the caller; only downloaded temporary files are removed.
func prepareSourcePath(source ImportGtfsConfigSource) (string, func(), error) {
	// Start with a cleanup function that does nothing for a caller-owned file.
	cleanup := func() {}
	if (source.Path == "") == (source.Url == "") {
		return "", cleanup, errors.New("source must contain exactly one of Path or Url")
	}
	if source.Path != "" {
		return source.Path, cleanup, nil
	}

	// Download remote sources with a time limit so a stalled server cannot wait forever.
	telemetry.Logger.Progress("Downloading GTFS archive from " + source.Url)
	client := http.Client{Timeout: 30 * time.Minute}
	response, err := client.Get(source.Url)
	if err != nil {
		return "", cleanup, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return "", cleanup, fmt.Errorf("download GTFS: %s", response.Status)
	}

	// Save the response as a temporary ZIP; the ZIP reader needs access to the file.
	file, err := os.CreateTemp("", "import-gtfs-*.zip")
	if err != nil {
		return "", cleanup, err
	}
	cleanup = func() { os.Remove(file.Name()) }

	// Check both writing and closing: either can reveal an incomplete download.
	_, copyError := io.Copy(file, response.Body)
	closeError := file.Close()
	if err := errors.Join(copyError, closeError); err != nil {
		cleanup()
		return "", func() {}, err
	}
	return file.Name(), cleanup, nil
}

// Opens the ZIP before any output database is changed.
// Its cleanup function closes the archive and removes any downloaded copy.
func prepareSource(source ImportGtfsConfigSource) (*zip.ReadCloser, func(), error) {
	sourcePath, cleanup, err := prepareSourcePath(source)
	if err != nil {
		return nil, cleanup, err
	}

	archive, err := zip.OpenReader(sourcePath)
	if err != nil {
		cleanup()
		return nil, func() {}, err
	}
	return archive, func() { archive.Close(); cleanup() }, nil
}
