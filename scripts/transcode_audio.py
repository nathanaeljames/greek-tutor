"""
transcode_audio.py -- Batch-transcode Greek/Hebrew Tutor WAVs to m4a (AAC).

Usage (Windows 11, after `winget install Gyan.FFmpeg` and a fresh terminal):

    python transcode_audio.py <input_dir> <output_dir> [--workers N] [--bitrate 32k]

Example:

    python transcode_audio.py D:\\rips\\GKTUTOR C:\\greektutor\\audio

Behavior:
  - Recursively finds *.WAV under input_dir.
  - Mirrors the directory structure under output_dir, lowercased,
    with .m4a extensions:  CHAPT_1/A_ALPHA.WAV -> chapt_1/a_alpha.m4a
  - Idempotent: skips outputs that already exist and are newer than
    their source. Re-run freely; only new/changed files are processed.
  - Loudness-normalizes (EBU R128 via ffmpeg loudnorm) so clips sit at
    an even volume, encodes AAC mono at --bitrate, keeps 11025 Hz.
  - Writes audio-manifest.json into output_dir when finished.
    Manifest key (audio ID) = relative path, lowercased, path separators
    replaced with underscores, extension dropped: "chapt_1_a_alpha".
    IDs are path-based because basenames repeat across chapters.

Requires: Python 3.9+, ffmpeg on PATH. No pip packages.
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


class TranscodeJob:
    """One WAV -> m4a conversion, carrying its own paths and result."""

    def __init__(self, src: Path, input_root: Path, output_root: Path):
        self.src = src
        rel = src.relative_to(input_root)
        rel_lower = Path(*[part.lower() for part in rel.parts])
        self.dst = (output_root / rel_lower).with_suffix(".m4a")
        self.rel_orig = str(rel).replace("\\", "/")
        self.rel_out = str(self.dst.relative_to(output_root)).replace("\\", "/")
        self.audio_id = self.rel_out.rsplit(".", 1)[0].replace("/", "_")
        self.status = "pending"  # pending | done | skipped | failed
        self.error = ""

    def needs_work(self) -> bool:
        return not (
            self.dst.exists()
            and self.dst.stat().st_mtime >= self.src.stat().st_mtime
            and self.dst.stat().st_size > 0
        )

    def run(self, bitrate: str) -> "TranscodeJob":
        if not self.needs_work():
            self.status = "skipped"
            return self
        self.dst.parent.mkdir(parents=True, exist_ok=True)
        cmd = [
            "ffmpeg", "-loglevel", "error", "-y",
            "-i", str(self.src),
            "-af", "loudnorm=I=-18:TP=-2:LRA=11",
            "-ar", "11025",
            "-ac", "1",
            "-c:a", "aac",
            "-b:a", bitrate,
            str(self.dst),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            self.status = "failed"
            self.error = result.stderr.strip().splitlines()[-1] if result.stderr else "unknown"
            if self.dst.exists():
                self.dst.unlink()  # never leave partial output behind
        else:
            self.status = "done"
        return self


class ManifestBuilder:
    """Collects finished jobs into audio-manifest.json, detecting ID collisions."""

    def __init__(self):
        self.entries = {}
        self.collisions = []

    def add(self, job: TranscodeJob):
        if job.audio_id in self.entries:
            self.collisions.append(job.audio_id)
            return
        self.entries[job.audio_id] = {
            "src": "audio/" + job.rel_out,
            "orig": job.rel_orig,
        }

    def write(self, output_root: Path):
        path = output_root / "audio-manifest.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.entries, f, indent=2, ensure_ascii=False, sort_keys=True)
        return path


def main():
    parser = argparse.ArgumentParser(description="Batch WAV -> m4a transcode with manifest.")
    parser.add_argument("input_dir", type=Path, help="Folder containing the ripped WAVs (e.g. GKTUTOR)")
    parser.add_argument("output_dir", type=Path, help="Destination folder for m4a output")
    parser.add_argument("--workers", type=int, default=os.cpu_count() or 4)
    parser.add_argument("--bitrate", default="32k", help="AAC bitrate (default 32k)")
    args = parser.parse_args()

    if shutil.which("ffmpeg") is None:
        sys.exit("ffmpeg not found on PATH. Install with: winget install Gyan.FFmpeg (then open a new terminal)")
    if not args.input_dir.is_dir():
        sys.exit(f"Input directory not found: {args.input_dir}")

    wavs = sorted(p for p in args.input_dir.rglob("*") if p.suffix.lower() == ".wav")
    if not wavs:
        sys.exit(f"No .wav files found under {args.input_dir}")

    jobs = [TranscodeJob(p, args.input_dir, args.output_dir) for p in wavs]
    print(f"Found {len(jobs)} WAV files. Transcoding with {args.workers} workers at {args.bitrate}...")

    manifest = ManifestBuilder()
    done = skipped = failed = 0
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(job.run, args.bitrate) for job in jobs]
        for i, future in enumerate(as_completed(futures), 1):
            job = future.result()
            if job.status == "done":
                done += 1
            elif job.status == "skipped":
                skipped += 1
            else:
                failed += 1
                print(f"  FAILED {job.rel_orig}: {job.error}")
            if i % 250 == 0 or i == len(jobs):
                print(f"  progress: {i}/{len(jobs)} (done {done}, skipped {skipped}, failed {failed})")

    for job in jobs:
        if job.status in ("done", "skipped"):
            manifest.add(job)

    manifest_path = manifest.write(args.output_dir)
    print(f"\nManifest written: {manifest_path} ({len(manifest.entries)} entries)")
    if manifest.collisions:
        print(f"WARNING: {len(manifest.collisions)} ID collisions (kept first occurrence):")
        for c in manifest.collisions[:20]:
            print("   ", c)
    if failed:
        print(f"WARNING: {failed} files failed. Re-run the same command to retry only failures.")


if __name__ == "__main__":
    main()
