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

    const githubProvider = new iam.OpenIdConnectProvider(this, 'GithubActionsProvider', {
      url: githubDomain,
      clientIds: ['sts.amazonaws.com'],
    })

    const iamRepoDeployAccess = props.repositoryConfig.map(r => `repo:${r.owner}/${r.repo}:${r.filter ?? '*'}`)

    const conditions: iam.Conditions = {
      StringLike: {
        'token.actions.githubusercontent.com:sub': iamRepoDeployAccess,
      },
      StringEquals: {
        'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        'token.actions.githubusercontent.com:iss': 'https://token.actions.githubusercontent.com',
      },
    }

    const role = new iam.Role(this, 'gitHubDeployRole', {
      assumedBy: new iam.WebIdentityPrincipal(githubProvider.openIdConnectProviderArn, conditions),
      managedPolicies: [],
      roleName: 'GithubActionsDeployRole',
      description: 'Used from GitHub Actions to deploy',
      maxSessionDuration: cdk.Duration.hours(1),
    })

    new cdk.CfnOutput(this, 'GithubActionOidcIamRoleArn', {
      value: role.roleArn,
      description: `Arn for AWS IAM role with Github oidc auth for ${iamRepoDeployAccess}`,
      exportName: 'GithubActionOidcIamRoleArn',
    })

    cdk.Tags.of(this).add('component', 'CdkGithubActionsOidcIamRole')
  }
}