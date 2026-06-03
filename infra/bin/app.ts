#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SiteDeliveryStack } from '../lib/site-delivery-stack';

const app = new cdk.App();

const region =
  typeof app.node.tryGetContext('region') === 'string'
    ? app.node.tryGetContext('region')
    : 'ap-northeast-1';

/** CloudFormation stack name — demo-magicpod-hotel-example-site sample infrastructure */
const stackName = 'DemoMagicpodHotelExampleSite';

new SiteDeliveryStack(app, stackName, {
  stackName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region,
  },
});
