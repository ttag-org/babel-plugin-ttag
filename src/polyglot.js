import program from 'commander';
import { extractFromFiles } from './extract';

program
    .command('extract <filepaths ...>')
    .description('Extracts gettext messages and saves them to pot file')
    .option('-o, --output <path>', 'path where to store pot files')
    .option('-c, --config <path>', 'path to alternative config')
    .option('-l, --locale [locales ...]',
        'Sets one or more locales to process (based on config). If is not set then all locales will processed')
    .action(extractFromFiles);

program.parse(process.argv);
