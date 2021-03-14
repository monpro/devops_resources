import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as codePipeline from '@aws-cdk/aws-codepipeline';
import * as pipelineAction from '@aws-cdk/aws-codepipeline-actions';
import * as codeBuild from '@aws-cdk/aws-codebuild';
import * as iam from '@aws-cdk/aws-iam';
import * as ssm from '@aws-cdk/aws-ssm';

interface CodePipelineBackendProps extends cdk.StackProps {
  envName: string;
}

export class CodePipelineBackend extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    bucketName: string,
    props: CodePipelineBackendProps
  ) {
    super(scope, id, props);

    const { envName } = props;
    const accountId = cdk.Aws.ACCOUNT_ID;
    const region = cdk.Aws.REGION;

    const githubToken = cdk.SecretValue.secretsManager(
      `${envName}/github-build-token`,
      {
        jsonField: 'github-build-token',
      }
    );

    const artifactBucket = s3.Bucket.fromBucketName(
      this,
      'artifactBucket',
      bucketName
    );

    const backendPipeline = new codePipeline.Pipeline(
      this,
      `${envName}-backend-pipeline`,
      {
        pipelineName: `${envName}-backend-pipeline`,
        artifactBucket: artifactBucket,
        restartExecutionOnUpdate: false,
      }
    );

    const buildProject = new codeBuild.PipelineProject(
      this,
      `${envName}-build-backend-project`,
      {
        projectName: `${envName}-build-backend-project`,
        description: `${envName}-lambda-function-build`,
        environment: {
          buildImage: codeBuild.LinuxBuildImage.STANDARD_3_0,
          environmentVariables: {
            ENV: {
              type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
              value: 'dev',
            },
            PRJ: {
              type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
              value: 'monBackendBuild',
            },
            STAGE: {
              type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
              value: 'dev',
            },
          },
        },
        cache: codeBuild.Cache.bucket(artifactBucket, {
          prefix: 'lambda-build-cache',
        }),
        buildSpec: codeBuild.BuildSpec.fromObject({
          version: '0.1',
          phases: {
            install: {
              commands: [
                'echo "--INSTALL PHASE--"',
                'npm install --silent --no-progress serverless -g',
              ],
            },
            pre_build: {
              commands: [
                'echo "--PRE BUILD PHASE --"',
                'npm install --silent --no-progress',
              ],
            },
            build: {
              commands: [
                'echo "--BUILD PHASE--"',
                'serverless deploy -s $STAGE',
              ],
            },
          },
          artifacts: {
            files: ['**/*'],
            'base-directory': '.serverless'
          },
        }),
      }
    );

    const sourceOutput = new codePipeline.Artifact('source');
    const buildOutput = new codePipeline.Artifact('build');

    backendPipeline.addStage({
      stageName: 'Source',
      actions: [
        new pipelineAction.GitHubSourceAction({
          oauthToken: githubToken,
          output: sourceOutput,
          repo: 'serverless-application',
          branch: 'main',
          owner: 'monpro',
          actionName: 'GitHubSource',
        }),
      ],
    });

    backendPipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new pipelineAction.CodeBuildAction({
          actionName: 'DeployToDev',
          input: sourceOutput,
          project: buildProject,
          outputs: [buildOutput],
        }),
      ],
    });

    buildProject.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
    );

    /**
     * You could use addToPolicy to customise the policyStatement
     *
    buildProject.role?.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'cloudformation:*',
          's3:*',
          'iam:*',
          'lambda:*',
          'apigateway:*',
        ],
        resources: ['*'],
      })
    );
     **/

    new ssm.StringParameter(this, 'accountId', {
      parameterName: `/${envName}/account-id`,
      stringValue: accountId,
    });

    new ssm.StringParameter(this, 'region', {
      parameterName: `/${envName}/region`,
      stringValue: region,
    });
  }
}
