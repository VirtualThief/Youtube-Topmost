module.exports = {
    "extends": "airbnb-base",
    "rules": {
        "no-underscore-dangle": ["error", { "allowAfterThis": true }],
        "no-use-before-define": ["error", "nofunc"],
    },
    "env": {
        "node": true,
        "browser": true,
    },
};