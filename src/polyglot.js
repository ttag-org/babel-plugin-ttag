import program from 'commander';
import { extractFromFiles } from './extract';
import { resolveForFiles } from './resolve';

program
    .command('extract <filepaths ...>')
    .description('Extracts gettext messages and saves them to pot file')
    .option('-c, --config <path>', 'path to alternative config')
    .option('-i, --interactive', 'Pass all results to stdout')
    .action(extractFromFiles);

program
    .command('resolve <filepaths ...>')
    .description('Extracts gettext messages and saves them to pot file')
    .option('-c, --config <path>', 'path to alternative config')
    .option('-p, --pofile <path>', 'path to po file')
    .action(resolveForFiles);

program.parse(process.argv);
