import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import type { Construct } from "constructs";

export class SiteDeliveryStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const stagingBucket = this.createWebsiteBucket("StagingBucket");
		const productionBucket = this.createWebsiteBucket("ProductionBucket");

		new cdk.CfnOutput(this, "StagingBucketName", {
			value: stagingBucket.bucketName,
			description: "S3 bucket for staging deployments (aws s3 sync target)",
		});

		new cdk.CfnOutput(this, "ProductionBucketName", {
			value: productionBucket.bucketName,
			description: "S3 bucket for production deployments (aws s3 sync target)",
		});

		new cdk.CfnOutput(this, "StagingBucketArn", {
			value: stagingBucket.bucketArn,
			description: "Staging bucket ARN (for account IAM policy grants)",
		});

		new cdk.CfnOutput(this, "ProductionBucketArn", {
			value: productionBucket.bucketArn,
			description: "Production bucket ARN (for account IAM policy grants)",
		});

		new cdk.CfnOutput(this, "StagingWebsiteUrl", {
			value: stagingBucket.bucketWebsiteUrl,
			description:
				"Public HTTP URL for staging (MagicPod test target base URL)",
		});

		new cdk.CfnOutput(this, "ProductionWebsiteUrl", {
			value: productionBucket.bucketWebsiteUrl,
			description: "Public HTTP URL for production",
		});
	}

	private createWebsiteBucket(id: string): s3.Bucket {
		return new s3.Bucket(this, id, {
			websiteIndexDocument: "index.html",
			websiteErrorDocument: "index.html",
			publicReadAccess: true,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
			encryption: s3.BucketEncryption.S3_MANAGED,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
			enforceSSL: false,
		});
	}
}
