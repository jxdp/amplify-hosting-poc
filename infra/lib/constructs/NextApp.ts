import {Construct} from "constructs";
import * as cdk from "aws-cdk-lib";
import {App, AppProps} from "@aws-cdk/aws-amplify-alpha";

export interface NextAppProps extends Pick<AppProps, "appName" | "basicAuth" | "description" | "environmentVariables"> {
	appRoot: string;
	repository: {
		accessToken: cdk.SecretValue;
		url: string;
	};
	branches: {
		development: string
		production?: string;
	};
}

export class NextApp extends App {
	constructor(scope: Construct, id: string, {appRoot, repository, branches, ...props}: NextAppProps) {
		super(scope, id, {
            ...props,
			autoBranchDeletion: true,
			buildSpec: nextAppBuildSpec({appRoot}),
		});
		(this.node.defaultChild as cdk.aws_amplify.CfnApp).platform = "WEB_COMPUTE";
		(this.node.defaultChild as cdk.aws_amplify.CfnApp).repository = repository.url;
		(this.node.defaultChild as cdk.aws_amplify.CfnApp).accessToken = repository.accessToken.unsafeUnwrap();

		this.addBranch(branches.development, {stage: "DEVELOPMENT"});
		if (!!branches.production) this.addBranch(branches.production, {stage: "PRODUCTION"});
		
		this.addEnvironment("AMPLIFY_MONOREPO_APP_ROOT", appRoot);
		this.addEnvironment("AMPLIFY_DIFF_DEPLOY", String(false));
		this.addEnvironment("AMPLIFY_DIFF_DEPLOY_ROOT", appRoot);
		this.addEnvironment("AMPLIFY_DIFF_BACKEND", String(false));
		this.addEnvironment("AMPLIFY_SKIP_BACKEND_BUILD", String(true));
	}
}

const nextAppBuildSpec = ({appRoot}: Pick<NextAppProps, "appRoot">) => 
	cdk.aws_codebuild.BuildSpec.fromObjectToYaml({
		version: 1,
		applications: [
			{
				appRoot,
				frontend: {
					phases: {
						preBuild: {
							commands: [
								"npm ci",
								"cp -r ../../node_modules .",
							],
						},
						build: {
							commands: [
								"npm run build",
							],
						},
					},
					artifacts: {
						baseDirectory: ".next",
						files: [
							"**/*",
						],
					},
					cache: {
						paths: [
							"../../node_modules/**/*",
							".next/cache/**/*",
						],
					},
				},
			},
		]
	});