import { Handler } from "aws-lambda";
import * as AWS from "aws-sdk";

export const start: Handler = async (event) =>
  new AWS.SNS({ apiVersion: "2010-03-31" })
    .publish({
      TopicArn: process.env.TOPIC_ARN,
      Message: JSON.stringify(event),
    })
    .promise();
