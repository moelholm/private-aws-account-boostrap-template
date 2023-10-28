#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GithubActionsAwsAuthCdkStack } from '../lib/github-actions-aws-auth-cdk-stack';

const app = new cdk.App();

new GithubActionsAwsAuthCdkStack(app, "GithubActionsAwsAuthCdkStack", {
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  repositoryConfig: [
    {
      owner: app.node.tryGetContext("repoOwner"),
      repo: app.node.tryGetContext("repoName"),
      filter: app.node.tryGetContext("repoBranch"),
    },
  ],
});