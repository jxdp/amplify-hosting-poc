import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NextApp, NextAppProps } from "../constructs/NextApp";

export type NextAppStackProps = StackProps & {
    nextAppProps: NextAppProps;
}

export class NextAppStack extends Stack {
    constructor(scope: Construct, id: string, {nextAppProps, ...props}: NextAppStackProps) {
        super(scope, id, props);
        const app = new NextApp(this, `${this.stackName}NextApp`, nextAppProps);
        new CfnOutput(this, "appId", {value: app.appId});
        new CfnOutput(this, "defaultDomain", {value: app.defaultDomain});
    }
}