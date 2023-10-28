# private-aws-account-bootstrap-template

Example AWS CDK TypeScript code (IaC) for bootstrapping a personal AWS account (non-corporate setup, single account).

Copy `cdk.context.template.json` to `cdk.context.json` and configure the values to your env.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
