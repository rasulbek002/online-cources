import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const ddbClient = new DynamoDBClient({});

export const handler = async (event: any) => {
  try {
    const { Items } = await ddbClient.send(
      new ScanCommand({
        TableName: "Courses",
      })
    );

    const courses = Items?.map((item) => {
      return unmarshall(item);
    });

    return {
      statusCode: 200,
      body: JSON.stringify(courses),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    };
  } catch (error) {
    console.error("Error scanning table:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
