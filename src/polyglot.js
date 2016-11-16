import program from 'commander';
import { extractFromFiles } from './extract';

program
    .command('extract <filepaths ...>')
    .description('Extracts gettext messages and saves them to pot file')
    .option('-o, --output <path>', 'path where to store pot files')
    .option('-c, --config <path>', 'path to alternative config')
    .option('-i, --interactive', 'Pass all results to stdout')
    .action(extractFromFiles);

program.parse(process.argv);
