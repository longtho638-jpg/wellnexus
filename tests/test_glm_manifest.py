from __future__ import annotations

import hashlib
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from project.glm_manifest import (  # noqa: E402  (import after sys.path setup)
    DEFAULT_MANIFEST_PATH,
    ManifestError,
    compute_sha256,
    load_manifest,
)


def test_load_manifest_uses_repository_copy() -> None:
    manifest = load_manifest()
    assert manifest.source == "GLM-4.6 Scaffold"
    assert manifest.gcs_path == "gs://YOUR_BUCKET/glm46/glm46-arch.tar"
    assert manifest.sha256 == "039ebb12a16a91485963a5fddfee247b7e5ee7b5ec18a311d999d42c7914b65e"


def test_download_command_renders_expected_gsutil_args(tmp_path) -> None:
    manifest = load_manifest()
    destination = tmp_path / "glm46.tar"
    assert manifest.download_command(destination) == [
        "gsutil",
        "cp",
        "gs://YOUR_BUCKET/glm46/glm46-arch.tar",
        str(destination),
    ]


def test_verify_tarball_requires_existing_file(tmp_path) -> None:
    manifest = load_manifest()
    missing_path = tmp_path / "does-not-exist.tar"
    with pytest.raises(FileNotFoundError):
        manifest.verify_tarball(missing_path)


def test_verify_tarball_detects_checksum_mismatch(tmp_path) -> None:
    manifest = load_manifest()
    fake_tar = tmp_path / "fake.tar"
    fake_tar.write_bytes(b"demo tarball contents")
    assert manifest.verify_tarball(fake_tar) is False


def test_compute_sha256_matches_python_hashlib(tmp_path) -> None:
    sample = tmp_path / "sample.bin"
    sample.write_bytes(b"glm46-sample")
    assert compute_sha256(sample) == hashlib.sha256(b"glm46-sample").hexdigest()


def test_manifest_validation_rejects_bad_paths(tmp_path) -> None:
    invalid_manifest = tmp_path / "manifest.json"
    invalid_manifest.write_text(
        '{"source": "GLM", "file": "/tmp/foo", "sha256": "123"}'
    )
    with pytest.raises(ManifestError):
        load_manifest(invalid_manifest)


def test_manifest_path_must_exist(tmp_path) -> None:
    missing_manifest = tmp_path / "missing.json"
    with pytest.raises(FileNotFoundError):
        load_manifest(missing_manifest)


def test_default_manifest_path_points_to_repo_copy() -> None:
    assert DEFAULT_MANIFEST_PATH.exists()
