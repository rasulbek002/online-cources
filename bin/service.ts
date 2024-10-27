#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
// import { AuthStack } from "../lib/auth-stack";
import { Storage } from "../lib/storage/storage";
import { CoursesAPI } from "../lib/lambdas/courses";
import { ServiceRestApi } from "../lib/rest-api";

import { AuthStack } from "../lib/auth-stack";

const app = new cdk.App();

new AuthStack(app, "AuthStack", {
  env: {
    account: "905417995001",
    region: "us-west-2",
  },
});
new Storage(app, "StorageStack", {
  env: {
    account: "905417995001",
    region: "us-west-2",
  },
});
new CoursesAPI(app, "CoursesAPI");
new ServiceRestApi(app, "ServiceRestApi");
