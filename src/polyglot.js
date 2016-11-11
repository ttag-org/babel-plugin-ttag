import program from "commander";

program
    .command('extract <filepaths ...>')
    .description('Extracts gettext messages and saves to pot file')
    .option("-o, --output <path>", "path where to store pot files")
    .action((filepaths, options) => {
        console.log(options);
        console.log('extracting', filepaths, options.output);
    });

program.parse(process.argv);
