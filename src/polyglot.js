import program from "commander";
import { extractFromFiles } from './extract';

program
	.option("-с, --config <path>", "path to config (.polyglot) is default")
	
program
    .command('extract <filepaths ...>')
    .description('Extracts gettext messages and saves them to pot file')
    .option("-o, --output <path>", "path where to store pot files")
    .option("-l, --locale [locales ...]", 
    	"Sets one or more locales to process (based on config). If is not set then all locales will processed")
    .action((filepaths, options) => {
    	extractFromFiles(filepaths, options)
    });

program.parse(process.argv);
