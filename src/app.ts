import YoutubeMp3Downloader from "youtube-mp3-downloader";
import prompt from "prompt-sync";

const input = prompt();
const inputVideosIds = input("Insert the videos IDs separated by comma:");
const inputTargetPath = input(
  "Insert the folder absolute path to save MP3 files:"
);

if (inputVideosIds) {
  const videosIds = inputVideosIds.split(",");
  const youtubeMp3Downloader = new YoutubeMp3Downloader({
    outputPath: inputTargetPath || __dirname.replace("/src", ""),
    progressTimeout: 2000,
    queueParallelism: 1,
    youtubeVideoQuality: "highestaudio",
  });
  youtubeMp3Downloader.on("finished", function (err, data) {
    console.log(`Finished downloading \"${data.videoTitle}\"`);
  });
  youtubeMp3Downloader.on("error", function (error) {
    console.log(error);
  });
  youtubeMp3Downloader.on("progress", function (progress) {
    console.log(
      `${progress.videoId} - ${progress.progress.percentage.toFixed(2)}%`
    );
  });

  for (const videoId of videosIds) {
    youtubeMp3Downloader.download(videoId);
  }
} else {
  throw Error("No input video was given");
}
