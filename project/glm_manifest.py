"""Utility helpers for working with the GLM 4.6 scaffold manifest.

The real scaffold bundle lives in Google Cloud Storage.  We keep only the
manifest in the repository so that production code can reference the canonical
location and checksum without copying the large `.tar` artifact into git.
"""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
from pathlib import Path
from typing import Iterable, Optional

__all__ = [
    "DEFAULT_MANIFEST_PATH",
    "ManifestError",
    "ScaffoldManifest",
    "compute_sha256",
    "load_manifest",
]


class ManifestError(RuntimeError):
    """Raised when the manifest is missing required information."""


DEFAULT_MANIFEST_PATH = (
    Path(__file__).resolve().parent / "_inputs" / "glm46" / "manifest.json"
)


@dataclass(frozen=True)
class ScaffoldManifest:
    """Typed wrapper around the manifest metadata."""

    source: str
    gcs_path: str
    sha256: str

    def download_command(self, destination: str | Path) -> list[str]:
        """Return a gsutil command that downloads the scaffold tarball.

        The command is returned as a list so callers can use it directly with
        :func:`subprocess.run` without going through a shell.
        """

        dest = Path(destination)
        return ["gsutil", "cp", self.gcs_path, str(dest)]

    def verify_tarball(self, tarball_path: str | Path) -> bool:
        """Return ``True`` when ``tarball_path`` matches the recorded checksum."""

        tarball = Path(tarball_path)
        if not tarball.exists():
            raise FileNotFoundError(f"Tarball does not exist: {tarball}")
        return compute_sha256(tarball) == self.sha256


def _read_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as stream:
        return json.load(stream)


def load_manifest(path: Optional[str | Path] = None) -> ScaffoldManifest:
    """Load and validate the GLM 4.6 manifest."""

    manifest_path = Path(path) if path is not None else DEFAULT_MANIFEST_PATH
    if not manifest_path.exists():
        raise FileNotFoundError(f"Manifest not found: {manifest_path}")

    raw_data = _read_json(manifest_path)
    try:
        source = raw_data["source"]
        gcs_path = raw_data["file"]
        sha256 = raw_data["sha256"]
    except KeyError as exc:  # pragma: no cover - defensive branch
        raise ManifestError(f"Missing required key in manifest: {exc.args[0]}") from exc

    if not source:
        raise ManifestError("Manifest 'source' cannot be empty")
    if not gcs_path.startswith("gs://"):
        raise ManifestError("Manifest 'file' must be a gs:// path")
    if len(sha256) != 64 or not all(c in "0123456789abcdef" for c in sha256.lower()):
        raise ManifestError("Manifest 'sha256' must be a 64 character hex digest")

    return ScaffoldManifest(source=source, gcs_path=gcs_path, sha256=sha256.lower())


def compute_sha256(path: str | Path, chunk_size: int = 1 << 20) -> str:
    """Calculate the SHA-256 checksum for ``path``."""

    digest = hashlib.sha256()
    with Path(path).open("rb") as stream:
        for chunk in _read_chunks(stream, chunk_size):
            digest.update(chunk)
    return digest.hexdigest()


def _read_chunks(stream, chunk_size: int) -> Iterable[bytes]:
    while True:
        chunk = stream.read(chunk_size)
        if not chunk:
            break
        yield chunk
