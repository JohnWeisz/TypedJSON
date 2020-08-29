function mapFilenames(filenames) {
    return filenames.map(filename => `"${filename}"`).join(' ');
}

module.exports = {
    '*': () => [
        'tsc -p tsconfig/tsconfig.app.json',
        'npm run test',
    ],
    '*.ts': (filenames) => [
        `eslint --fix --cache ${mapFilenames(filenames)}`,
    ],
};
