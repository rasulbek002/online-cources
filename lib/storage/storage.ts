import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class Storage extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const coursesTableName = "Courses";

    const coursesTable = new Table(this, coursesTableName, {
      tableName: coursesTableName,
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "authorId",
        type: AttributeType.STRING,
      },
    });

    new CfnOutput(this, `${coursesTableName}Output`, {
      exportName: `${coursesTableName}TableArn`,
      value: coursesTable.tableArn,
    });
  }
}
