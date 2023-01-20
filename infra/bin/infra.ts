#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { NextAppStack } from '../lib/stacks/NextAppStack';
import { SecretValue } from 'aws-cdk-lib';

const app = new cdk.App();

const repository = {
  url: "https://github.com/jdpst/amplify-hosting-poc",
  accessToken: SecretValue.secretsManager("github-token-temp"),
};

new NextAppStack(app, 'WebStack', {
  nextAppProps: {
    appRoot: "apps/web",
    branches: {development: "main"},
    repository,
  }
});

new NextAppStack(app, 'AdminStack', {
  nextAppProps: {
    appRoot: "apps/admin",
    branches: {development: "main"},
    repository,
  }
});