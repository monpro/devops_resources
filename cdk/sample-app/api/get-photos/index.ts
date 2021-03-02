import {APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context} from "aws-lambda";
import {S3} from 'aws-sdk';

const s3 = new S3();
const bucketName = process.env.PHOTO_BUCKET_NAME!;

const generateUrl = async (object: S3.Object): Promise<{ filename: string, url: string }> => {
  const url = await s3.getSignedUrlPromise('getObject', {
    Bucket: bucketName,
    Key: object.Key!,
    Expires: 24 * 60 * 60
  });
  return {
    filename: object.Key!,
    url
  }
};

export const getPhotos = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> => {
  try {
    const {Contents: results} = await s3.listObjects({Bucket: bucketName}).promise();
    const photos = await Promise.all(results!.map(result => generateUrl(result)));
    return {
      statusCode: 200,
      body: JSON.stringify(photos)
    }

  } catch (e) {
    return {
      statusCode: 500,
      body: e.message
    }
  }
};
