function mapFilenames(filenames) {
    return filenames.map(filename => `"${filename}"`).join(' ');
}

module.exports = {
    '*': () => [
        'yarn run test',
        'yarn run test:ts',
    ],
    '*.ts': (filenames) => [
        `eslint --fix --cache ${mapFilenames(filenames)}`,
    ],
};
