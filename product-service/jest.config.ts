/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
    // Automatically clear mock calls, instances, contexts and results before every test
    clearMocks: true,

    // Indicates which provider should be used to instrument code for coverage
    coverageProvider: 'v8',

    verbose: true,

    // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
    moduleNameMapper: {
        '@functions(.*)$': '<rootDir>/src/functions/$1',
        '@libs(.*)$': '<rootDir>/src/libs/$1',
        '@types': '<rootDir>/src/types',
        "@constants": '<rootDir>/src/constants'
    },

    // A preset that is used as a base for Jest's configuration
    preset: 'ts-jest',

    // The test environment that will be used for testing
    testEnvironment: 'jest-environment-node',
};
