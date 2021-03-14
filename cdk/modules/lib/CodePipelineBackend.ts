import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as codePipeline from '@aws-cdk/aws-codepipeline';
import * as pipelineAction from '@aws-cdk/aws-codepipeline-actions';
import * as codeBuild from '@aws-cdk/aws-codebuild';

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

    const githubToken = cdk.SecretValue.secretsManager(
      `${envName}/github-token`,
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
      'build-backend-project',
      {
        projectName: `${envName}-build-backend-project`,
        description: `${envName}-lambda-function-build`,
        environment: {
          buildImage: codeBuild.LinuxBuildImage.STANDARD_3_0,
          environmentVariables: {
            ENV: {
              value: 'dev',
            },
            PRJ: {
              value: 'monBackendBuild',
            },
            STAGE: {
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
          },
          artifacts: {
            files: ['**/*'],
            'base-directory': '.serverless',
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
          repo: 'devops_resources',
          branch: 'master',
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
  }
}
