# appsync-iam-query-helper

This repository hosts a script that allows you to run any GraphQL operation using AppSync's IAM Authorization mode.

## Instructions to use
- Clone the repository using `git clone git@github.com:phani-srikar/appsync-iam-query-helper.git`
- Install dependencies using `npm install`
- Create a `.env` file at the root and populate it with the keys as shown in `sample.env`
- Update the GraphQL operation to run and the IAM Auth type in the `main.ts`
- Set the temporary AWS credentials to use in your environment
- Run `npx ts-node main.ts` and see the result of the GraphQL operation in the console
