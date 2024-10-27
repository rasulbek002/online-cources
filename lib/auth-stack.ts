import { CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import {
  CfnIdentityPoolRoleAttachment,
  OAuthScope,
  StringAttribute,
  UserPool,
  UserPoolClient,
  UserPoolClientOptions,
  VerificationEmailStyle,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class AuthStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const projectName = "SabakOne";
    const userPoolName = `${projectName}UserPool`;

    const userPool = new UserPool(this, userPoolName, {
      userPoolName,
      // ...
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: "Verify your email for our awesome app!",
        emailBody:
          "Thanks for signing up to our awesome app! Your verification code is {####}",
        emailStyle: VerificationEmailStyle.CODE,
        smsMessage:
          "Thanks for signing up to our awesome app! Your verification code is {####}",
      },
      signInAliases: {
        username: true,
        email: true,
      },
      signInCaseSensitive: false,
      autoVerify: {
        email: true,
      },
      customAttributes: {
        role: new StringAttribute({
          minLen: 1,
          maxLen: 30,
          mutable: true,
        }),
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        phoneNumber: {
          required: false,
          mutable: true,
        },
      },
    });

    const userPoolIDExportName = `${projectName}UserPoolID`;
    const userPoolURLExportName = `${projectName}UserPoolURL`;

    new CfnOutput(this, userPoolIDExportName, {
      value: userPool.userPoolId,
      exportName: userPoolIDExportName,
    });

    new CfnOutput(this, userPoolURLExportName, {
      value: userPool.userPoolProviderUrl,
      exportName: userPoolURLExportName,
    });

    // User pool clients
    const clients = [
      {
        accessTokenValidity: Duration.hours(1),
        refreshTokenValidity: Duration.days(30),
        userPoolClientName: "web",
      },
    ];

    clients.map((options: UserPoolClientOptions) => {
      const { userPoolClientName } = options;
      // A user pool client to use Cognito client in a mobile app.
      const clientLogicalId = `${userPoolClientName}UserPoolClient`;

      const client = new UserPoolClient(this, clientLogicalId, {
        authFlows: {
          custom: true,
          userPassword: true,
          userSrp: true,
        },
        ...options,
        oAuth: {
          flows: { authorizationCodeGrant: true },
          scopes: [OAuthScope.OPENID],
        },
        userPool,
        userPoolClientName: `${userPoolName}-${userPoolClientName}`,
      });

      // Prints out the User Pool domain to the terminal.
      const exportName = `${projectName}${clientLogicalId}ID`;

      new CfnOutput(this, exportName, {
        value: client.userPoolClientId,
        exportName: exportName,
      });

      return client;
    });
  }
}
