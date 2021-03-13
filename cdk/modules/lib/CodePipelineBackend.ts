import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as codePipeline from '@aws-cdk/aws-codepipeline';
import * as pipelineAction from '@aws-cdk/aws-codepipeline-actions';

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

    const pipeline = new codePipeline.Pipeline(
      this,
      `${envName}-backend-pipeline`,
      {
        pipelineName: `${envName}-backend-pipeline`,
        artifactBucket: artifactBucket,
        restartExecutionOnUpdate: false,
      }
    );

    const sourceOutput = new codePipeline.Artifact('source');
    const buildOutput = new codePipeline.Artifact('build');

    pipeline.addStage({
      stageName: 'Source',
      actions: [],
    });
  }
}
