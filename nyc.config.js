module.exports = {
    extends: '@istanbuljs/nyc-config-typescript',
    all: true,
    include: ['src/**'],
    reporter: ['lcovonly', 'text', 'text-summary'],
};
