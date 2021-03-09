import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as redis from '@aws-cdk/aws-elasticache';

interface RedisStackProps extends cdk.StackProps {
    envName: string;
}

export class RedisStack extends cdk.Stack {
    private readonly redisCluster: redis.CfnCacheCluster;
    private readonly redisSubnetGroup: redis.CfnSubnetGroup;

    constructor(
        scope: cdk.Construct,
        id: string,
        vpc: ec2.Vpc,
        securityGroups: string[],
        props: RedisStackProps
    ) {
        super(scope, id, props);

        const { envName } = props;

        const privateSubnetsIds = vpc.privateSubnets.map(
            (subnet) => subnet.subnetId
        );

        this.redisSubnetGroup = new redis.CfnSubnetGroup(
            this,
            'monRedisSubnetGroup',
            {
                subnetIds: privateSubnetsIds,
                description: 'subnet group for monRedisCluster',
            }
        );

        this.redisCluster = new redis.CfnCacheCluster(this, 'monRedisCluster', {
            cacheNodeType: 'cache.t2.small',
            engine: 'redis',
            numCacheNodes: 1,
            clusterName: `mon-${envName}-redis`,
            cacheSubnetGroupName: this.redisSubnetGroup.ref,
            vpcSecurityGroupIds: securityGroups,
            autoMinorVersionUpgrade: true,
        });

        this.redisCluster.addDependsOn(this.redisSubnetGroup);

        // new ssm.StringParameter(this, 'monRedisEndpoint', {
        //   parameterName: `/mon/${envName}/redisEndpoint`,
        //   stringValue: this.redisCluster.attrConfigurationEndpointAddress
        // });
        //
        // new ssm.StringParameter(this, 'monRedisEndPort', {
        //   parameterName: `/mon/${envName}/redisPort`,
        //   stringValue: this.redisCluster.attrConfigurationEndpointPort
        // });
    }
}
