import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { PutObjectCommand,S3Client  } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const importProductsFile = async (event): Promise<APIGatewayProxyResultV2> => {
    const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: `uploaded/${event.queryStringParameters.name}`,
      });
    const client = new S3Client({ region: 'us-east-1' });
    try {
        const response = await getSignedUrl(client, command, { expiresIn: 3600 });
        console.log(response);
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*'
            },
            body: JSON.stringify(response),
        }
      } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify(err.message),
        }
      }
};

export default importProductsFile;
