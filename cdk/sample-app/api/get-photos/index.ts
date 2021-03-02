import {APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context} from "aws-lambda";

export const getPhotos = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> => {
  return {
    statusCode: 200,
    body: 'test msg from lambda function'
  }
};
