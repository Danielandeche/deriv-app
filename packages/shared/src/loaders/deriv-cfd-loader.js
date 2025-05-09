module.exports = function (source, map) {
    // This is now a pass-through loader that does nothing
    return this.callback(null, source, map);
};