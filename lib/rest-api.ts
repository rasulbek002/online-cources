import { Fn, Stack } from "aws-cdk-lib";
import {
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Function } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class ServiceRestApi extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const userPoolId = Fn.importValue("SabakOneUserPoolId");
    const userPool = UserPool.fromUserPoolId(this, "UserPool", userPoolId);

    const cognitoUserPoolAuthorizer = new CognitoUserPoolsAuthorizer(
      this,
      "CognitoUserPoolAuthorizer",
      {
        cognitoUserPools: [userPool],
      }
    );

    const coursesApiArn = Fn.importValue("CoursesAPIArn");

    const coursesApi = Function.fromFunctionArn(
      this,
      "CoursesAPI",
      coursesApiArn
    );

    const api = new RestApi(this, "RestApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
    });

    const coursesAPI = api.root.addResource("courses");

    const listCoursesMethod = coursesAPI.addMethod(
      "GET",
      new LambdaIntegration(coursesApi),
      {
        authorizer: cognitoUserPoolAuthorizer,
        operationName: "listCourses",
      }
    );

    (coursesApi as any).canCreatePermissions = true;

    const lambdaAPIs = [
      {
        lambda: coursesApi,
        methodArn: listCoursesMethod.methodArn,
      },
    ];

    lambdaAPIs.forEach(({ lambda, methodArn }, index) => {
      lambda.addPermission(`APIGatewayLambaInvokePermission-${index}`, {
        action: "lambda:InvokeFunction",
        principal: new ServicePrincipal("apigateway.amazonaws.com"),
        sourceArn: methodArn,
      });
    });
  }
}
