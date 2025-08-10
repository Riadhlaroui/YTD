package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os/exec"
	"time"
)

func downloadHandler(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("url")
	downloadPath := r.URL.Query().Get("path")
	mode := r.URL.Query().Get("mode")

	if url == "" {
		http.Error(w, "Missing URL", http.StatusBadRequest)
		return
	}

	if downloadPath == "" {
		http.Error(w, "Missing download path", http.StatusBadRequest)
		return
	}

	log.Println("Download URL:", url)
	log.Println("Download Path:", downloadPath)
	log.Println("Mode:", mode)

	const maxRetries = 10
	var output []byte
	var resolution int
	var errDownload error

	for attempt := 1; attempt <= maxRetries; attempt++ {
		log.Printf("Attempt %d/%d...", attempt, maxRetries)

		var cmd *exec.Cmd
		if mode == "audio" {
			// Audio-only download
			cmd = exec.Command(
				"yt-dlp",
				"-x",
				"-P", downloadPath,
				url,
			)
		} else {
			// Video + audio download
			cmd = exec.Command(
				"yt-dlp",
				"-f", "bv*+ba/b",
				"--merge-output-format", "mp4",
				"-P", downloadPath,
				"--print-json",
				"--no-warnings",
				"--no-progress",
				url,
			)
		}

		output, errDownload = cmd.CombinedOutput()
		if errDownload != nil {
			log.Printf("yt-dlp error: %v\n%s", errDownload, string(output))
		}

		if mode != "audio" {
			var info struct {
				Width  int `json:"width"`
				Height int `json:"height"`
			}
			if err := json.Unmarshal(output, &info); err != nil {
				log.Printf("Failed to parse yt-dlp JSON: %v", err)
			} else {
				resolution = info.Height
				log.Printf("Downloaded resolution: %dp", resolution)
			}

			if resolution >= 1080 {
				log.Println("Got desired resolution, stopping retries.")
				break
			}

			log.Println("Resolution below 1080p, retrying...")
			time.Sleep(2 * time.Second)
		} else {
			break
		}
	}

	if errDownload != nil && mode != "audio" && resolution < 1080 {
		http.Error(w, "Failed to get high quality video after retries", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
}

func videoInfoHandler(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("url")
	if url == "" {
		http.Error(w, "Missing URL", http.StatusBadRequest)
		return
	}

	// Run yt-dlp to get video info
	cmd := exec.Command("yt-dlp", "--dump-json", url)
	output, err := cmd.Output()
	if err != nil {
		http.Error(w, "Failed to run yt-dlp: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return JSON response to frontend
	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
}

func main() {
	http.HandleFunc("/api/fetchInfo", videoInfoHandler)
	http.HandleFunc("/api/download", downloadHandler)
	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
