var define = (function () {
    var _modules = {};
    return define;
    function define(module, requires, callback) {
        var _this_module = {
            exports: {}
        };
        var params = requires.map(function (module) {
            if (module == 'exports') {
                return _this_module.exports;
            }
            else if (module == 'require') {
                return require;
            }
            return require(module);
        });
        callback.apply(this, params);
        _modules[module] = _this_module.exports;
    }
    function require(module) {
        return _modules[module];
    }
})();
