import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { aws_iam as iam } from 'aws-cdk-lib'

export interface GithubActionsAwsAuthCdkStackProps extends cdk.StackProps {
  readonly repositoryConfig: { owner: string; repo: string; filter?: string }[]
}

export class GithubActionsAwsAuthCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GithubActionsAwsAuthCdkStackProps) {
    super(scope, id, props)

    const githubDomain = 'https://token.actions.githubusercontent.com'

    const githubProvider = new iam.OpenIdConnectProvider(this, 'GithubActionsOidcProvider', {
      url: githubDomain,
      clientIds: ['sts.amazonaws.com'],
    })

    const iamRepoDeployAccess = props.repositoryConfig.map(r => `repo:${r.owner}/${r.repo}:${r.filter ?? '*'}`)

    const conditions: iam.Conditions = {
      StringLike: {
        'token.actions.githubusercontent.com:sub': iamRepoDeployAccess,
      },
      StringEquals: {
        'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com'
      },
    }

    const role = new iam.Role(this, 'GitHubDeployRole', {
      assumedBy: new iam.WebIdentityPrincipal(githubProvider.openIdConnectProviderArn, conditions),
      managedPolicies: [],
      roleName: 'GithubActionsDeployRole',
      description: 'Used from GitHub Actions to deploy',
      maxSessionDuration: cdk.Duration.hours(1),
    })

    new cdk.CfnOutput(this, 'GithubActionsDeployRoleArn', {
      value: role.roleArn,
      description: `Arn for the AWS IAM Role used by GitHub Actions to deploy`,
      exportName: 'GithubActionsDeployRoleArn',
    })

    cdk.Tags.of(this).add('component', 'CdkGithubActionsOidcIamRole')
  }
}