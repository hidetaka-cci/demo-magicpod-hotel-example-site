import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = join(__dirname, "..", "..");

const configs = [
	{
		path: ".circleci/deploy.yml",
		content: readFileSync(join(repoRoot, ".circleci/deploy.yml"), "utf8"),
	},
	{
		path: ".circleci/config.with-approval.yml",
		content: readFileSync(
			join(repoRoot, ".circleci/config.with-approval.yml"),
			"utf8",
		),
	},
];

describe("deploy pipeline AWS environment guard", () => {
	for (const { path, content } of configs) {
		describe(path, () => {
			// Regression: pipeline #58 deploy-staging failed with
			//   aws: [ERROR]: Invalid endpoint: https://s3..amazonaws.com
			// because aws-cli/setup received an empty `region: ${AWS_REGION}` value.
			// The assume-aws-role command must abort early when AWS_REGION is
			// missing so the failure is obvious and the deploy marker reports
			// a clear cause instead of a malformed S3 endpoint.
			it("aborts when AWS_REGION is unset before configuring the AWS CLI", () => {
				expect(content).toMatch(/\$\{AWS_REGION:\?[^}]+\}/);
			});

			it("aborts when AWS_ROLE_ARN is unset before configuring the AWS CLI", () => {
				expect(content).toMatch(/\$\{AWS_ROLE_ARN:\?[^}]+\}/);
			});
		});
	}
});
