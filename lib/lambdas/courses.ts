import { CfnOutput, Fn, Stack } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class CoursesAPI extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const lambda = new Function(this, "CoursesLambda", {
      runtime: Runtime.NODEJS_20_X,
      handler: "api/courses/courses-handler.handler",
      code: Code.fromAsset("api/courses"),
      memorySize: 128,
    });

    const coursesTableArn = Fn.importValue("CoursesTableArn");

    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: [
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:ConditionCheckItem",
          "dynamodb:PutItem",
          "dynamodb:DescribeTable",
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
        ],
        resources: [coursesTableArn],
      })
    );

    new CfnOutput(this, "CoursesAPIOutput", {
      exportName: "CoursesAPIArn",
      value: lambda.functionArn,
    });
  }
}
