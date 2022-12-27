import fs from "fs";
import nodeID3 from "node-id3";
import prompt from "prompt-sync";
import YoutubeMp3Downloader from "youtube-mp3-downloader";
import { music } from "./types/music";

async function main() {
  const input = prompt();
  const inputMusicListFilePath = input("Insert the music list file path:");
  const inputTargetPath = input(
    "Insert the folder absolute path to save MP3 files:"
  );
  const targetPath = inputTargetPath || __dirname.replace("/src", "");
  const rawMusicList = fs.readFileSync(inputMusicListFilePath);
  const musicList: music[] = JSON.parse(rawMusicList.toString());

  const youtubeMp3Downloader = new YoutubeMp3Downloader({
    outputPath: targetPath,
    progressTimeout: 2000,
    queueParallelism: 10,
    youtubeVideoQuality: "highestaudio",
  });
  youtubeMp3Downloader.on("error", function (error) {
    console.log(error);
  });
  youtubeMp3Downloader.on("progress", function (progress) {
    console.log(
      `${progress.videoId} - ${progress.progress.percentage.toFixed(2)}%`
    );
  });
  youtubeMp3Downloader.on("finished", function (err, data) {
    console.log(`Finished downloading \"${data.videoTitle}\"`);
  });
  youtubeMp3Downloader.on("queueSize", function (size) {
    if (size === 0) {
      for (const music of musicList) {
        console.log(`Tagging ${music.path}`);
        nodeID3.write(
          { title: music.title, artist: music.artist },
          music.path || ""
        );
      }
    }
  });

  for (const music of musicList) {
    const regexVideoId = /(?<=watch\?v=).*?(?=&|$)/g;
    const musicUrlVideoIdMatch = music.url.match(regexVideoId);
    const videoId = musicUrlVideoIdMatch ? musicUrlVideoIdMatch[0] : "";
    const fileName = `${music.title} - ${music.artist}.mp3`;
    const filePath = `${targetPath}/${fileName}`;

    music.path = filePath;

    youtubeMp3Downloader.download(videoId, fileName);
  }
}

main();
