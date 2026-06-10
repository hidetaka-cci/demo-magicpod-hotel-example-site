#!/usr/bin/env python3
"""MagicPod batch-run JSON を JUnit XML に変換する。"""
import json
import sys
from datetime import datetime
from xml.sax.saxutils import escape


def duration(started, finished):
    try:
        s = datetime.fromisoformat(started.replace("Z", "+00:00"))
        f = datetime.fromisoformat(finished.replace("Z", "+00:00"))
        return (f - s).total_seconds()
    except (ValueError, AttributeError, TypeError):
        return 0.0


def main(in_path, out_path):
    with open(in_path) as f:
        data = json.load(f)

    suites = []
    for detail in data.get("test_cases", {}).get("details", []):
        classname = detail.get("pattern_name") or data.get("test_setting_name", "MagicPod")
        cases, failures, errors = [], 0, 0
        for r in detail.get("results", []):
            name = r["test_case"]["name"]
            url = r["test_case"].get("url", "")
            t = duration(r.get("started_at"), r.get("finished_at"))
            status = r["status"]
            body = ""
            if status == "failed":
                failures += 1
                body = (
                    f'<failure message="MagicPod test failed">'
                    f"{escape(url)}</failure>"
                )
            elif status == "aborted":
                errors += 1
                body = f'<error message="aborted">{escape(url)}</error>'
            elif status == "unresolved":
                body = (
                    f'<system-out>unresolved (self-healing): {escape(url)}</system-out>'
                )
            cases.append(
                f'  <testcase classname="{escape(classname)}" '
                f'name="{escape(name)}" time="{t:.3f}">{body}</testcase>'
            )
        suites.append(
            f'<testsuite name="{escape(classname)}" tests="{len(cases)}" '
            f'failures="{failures}" errors="{errors}">\n'
            + "\n".join(cases)
            + "\n</testsuite>"
        )

    with open(out_path, "w") as f:
        f.write(
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<testsuites>\n"
            + "\n".join(suites)
            + "\n</testsuites>\n"
        )


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
