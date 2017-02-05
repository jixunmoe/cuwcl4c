var define = (function () {
    var _modules = { };
    
    return define;
    
    
    function define (module: string, requires: string[], callback) {
        var _this_module = {
            exports: {}
        };
        var params = requires.map((module: string) => {
            if (module == 'exports') {
                return _this_module.exports;
            } else if (module == 'require') {
                return require;
            }
            
            return require(module);
        });
        
        callback.apply(this, params);
        _modules[module] = _this_module.exports;
    }
    
    function require(module:string) {
        return _modules[module];
    }
})();
