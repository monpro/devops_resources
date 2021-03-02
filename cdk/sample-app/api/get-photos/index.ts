import {APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context} from "aws-lambda";

const bucketName = process.env.PHOTO_BUCKET_NAME;
export const getPhotos = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> => {
  return {
    statusCode: 200,
    body: `test msg from lambda function, the bucket name is ${bucketName}`
  }
};
