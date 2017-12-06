'use strict';

const path = require('path');

const npmCheck = require('npm-check');
const chalk = require('chalk');

const log = (msg) => console.log(msg);
const notice = (msg) => log(chalk.blue(msg));
const success = (msg) => log(chalk.green(msg));
const failure = (msg) => log(chalk.yellow(msg));
const error = (msg) => log(chalk.red(msg));

const config = require('./config');
const projects = config.map(dir => ({ dir, name: path.basename(dir) }));

log('-- Start checking projects dependencies --');
(async()=>{try{
	for(const project of projects){
		const {dir, name} = project;

		notice(`\n***** ${name} *****`);

		let failures = false;
		const currentState =  await npmCheck({cwd:dir});
		currentState.get('packages').forEach(dep => {
			const issues = [];

			if (dep.packageJson) {
				if (dep.notInstalled) {
					issues.push(`not installed`);
				}
				if (dep.installed !== dep.latest) {
					issues.push(`out of date ( installed is ${dep.installed} / latest is ${dep.latest} )`);
				}
				if (dep.installed !== dep.packageJson) {
					issues.push(`use the range version ${dep.packageJson} / should use the strict one ${dep.latest}`);
				}
			}

			if (issues.length > 0) {
				failures = true;
				failure([
					`Issue detected - ${name} - ${dep.moduleName}`,
					...issues.map(issue => `  - ${issue}`)
				].join('\n'))
			}
		});

		failures ? error(`❌`) : success(`👍`);
	}
} catch (err) { error(err.message); log(err.stack); }})();