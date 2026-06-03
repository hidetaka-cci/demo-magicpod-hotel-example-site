import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import { SiteDeliveryStack } from "./site-delivery-stack";

describe("SiteDeliveryStack", () => {
	it("creates two website buckets with static hosting configuration", () => {
		const app = new App();
		const stack = new SiteDeliveryStack(app, "TestStack", {
			env: { account: "123456789012", region: "ap-northeast-1" },
		});
		const template = Template.fromStack(stack);

		template.resourceCountIs("AWS::S3::Bucket", 2);
		template.hasResourceProperties("AWS::S3::Bucket", {
			WebsiteConfiguration: {
				IndexDocument: "index.html",
				ErrorDocument: "index.html",
			},
			PublicAccessBlockConfiguration: Match.objectLike({
				BlockPublicAcls: true,
			}),
		});
	});

	it("exports staging and production bucket metadata", () => {
		const app = new App();
		const stack = new SiteDeliveryStack(app, "TestStack", {
			env: { account: "123456789012", region: "ap-northeast-1" },
		});
		const template = Template.fromStack(stack);

		const outputs = template.findOutputs("*");
		const outputIds = Object.keys(outputs);
		expect(outputIds).toHaveLength(6);
		expect(outputIds).toEqual(
			expect.arrayContaining([
				"StagingBucketName",
				"ProductionBucketName",
				"StagingBucketArn",
				"ProductionBucketArn",
				"StagingWebsiteUrl",
				"ProductionWebsiteUrl",
			]),
		);
	});
});
