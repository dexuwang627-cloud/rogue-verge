#!/usr/bin/env python3
import argparse
import json
import re
import sys
from pathlib import Path

EXTS = {".py", ".js", ".jsx", ".ts", ".tsx"}

IMPORT_FROM_RE = re.compile(r"\bfrom\s+['\"]([^'\"]+)['\"]")
IMPORT_RE = re.compile(r"\bimport\s+['\"]([^'\"]+)['\"]")
PY_FROM_RE = re.compile(r"^\s*from\s+([a-zA-Z0-9_\.]+)\s+import\s+")
PY_IMPORT_RE = re.compile(r"^\s*import\s+([a-zA-Z0-9_\.]+)")


def posix(path: Path) -> str:
    return path.as_posix().lstrip("./")


def collect_files(root: Path):
    skip = {"node_modules", ".git", "dist", "build", ".next", "coverage", "playwright-report", "test-results", "architecture-report"}
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        if any(part in skip for part in p.parts):
            continue
        if p.suffix in EXTS:
            yield p


def resolve_js_import(spec: str, file_path: Path, root: Path, aliases: dict[str, str]) -> str | None:
    spec = spec.strip()
    for alias, target in aliases.items():
        if spec.startswith(alias):
            return posix(Path(target) / spec[len(alias):])

    if spec.startswith("./") or spec.startswith("../"):
        resolved = (file_path.parent / spec).resolve()
        try:
            return posix(resolved.relative_to(root.resolve()))
        except Exception:
            return None
    return None


def extract_import_targets(file_path: Path, root: Path, aliases: dict[str, str]) -> list[str]:
    text = file_path.read_text(encoding="utf-8", errors="ignore")
    targets: list[str] = []

    if file_path.suffix in {".js", ".jsx", ".ts", ".tsx"}:
        for m in IMPORT_FROM_RE.finditer(text):
            t = resolve_js_import(m.group(1), file_path, root, aliases)
            if t:
                targets.append(t)
        for m in IMPORT_RE.finditer(text):
            t = resolve_js_import(m.group(1), file_path, root, aliases)
            if t:
                targets.append(t)

    if file_path.suffix == ".py":
        for line in text.splitlines():
            m = PY_FROM_RE.match(line)
            if m:
                targets.append(m.group(1).replace(".", "/"))
                continue
            m = PY_IMPORT_RE.match(line)
            if m:
                targets.append(m.group(1).split(",")[0].strip().replace(".", "/"))
    return targets


def starts_with_path(path: str, prefix: str) -> bool:
    path = path.strip("/")
    prefix = prefix.strip("/")
    return path == prefix or path.startswith(prefix + "/")


def write_json(path: str | None, payload: dict):
    if not path:
        return
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_mermaid(path: str | None, edges: set[tuple[str, str]]):
    if not path:
        return
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    lines = ["flowchart LR"]
    for a, b in sorted(edges):
        if a == b:
            continue
        lines.append(f"  {a.replace('/', '_').replace('-', '_')}[{a}] --> {b.replace('/', '_').replace('-', '_')}[{b}]")
    p.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="architecture-rules.json")
    parser.add_argument("--root", default=".")
    parser.add_argument("--violations-out", default=None)
    parser.add_argument("--dependencies-out", default=None)
    parser.add_argument("--graph-out", default=None)
    parser.add_argument("--allow-violations", action="store_true")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    cfg_path = (root / args.config).resolve()
    if not cfg_path.exists():
        print(f"[architecture-guard] Missing config: {cfg_path}")
        return 1

    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    rules = cfg.get("rules", [])
    aliases = cfg.get("aliases", {})

    violations: list[dict] = []
    edges: set[tuple[str, str]] = set()

    for f in collect_files(root):
        rel = posix(f.relative_to(root))
        targets = extract_import_targets(f, root, aliases)
        if not targets:
            continue

        for t in targets:
            t_clean = t.strip("/")
            edges.add((rel, t_clean))

        for rule in rules:
            frm = rule.get("from", "").strip("/")
            forbidden = [x.strip("/") for x in rule.get("forbidden", [])]
            rule_id = rule.get("id", "rule")
            if not frm or not forbidden:
                continue
            if not starts_with_path(rel, frm):
                continue

            for t in targets:
                t_clean = t.strip("/")
                for bad in forbidden:
                    if starts_with_path(t_clean, bad):
                        violations.append({
                            "rule": rule_id,
                            "from": rel,
                            "to": t_clean,
                            "forbidden": bad,
                        })

    write_json(args.violations_out, {
        "root": str(root),
        "violationCount": len(violations),
        "violations": violations,
    })
    write_json(args.dependencies_out, {
        "root": str(root),
        "edgeCount": len(edges),
        "dependencies": [{"from": a, "to": b} for a, b in sorted(edges)],
    })
    write_mermaid(args.graph_out, edges)

    if violations:
        print("[architecture-guard] Violations found:")
        for v in violations:
            print(f"  - {v['rule']}: {v['from']} -> {v['to']} (forbidden: {v['forbidden']})")
        if args.allow_violations:
            print("[architecture-guard] Completed with violations (allowed)")
            return 0
        return 1

    print("[architecture-guard] OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
