var service={
    getJSONProperty: function(key){
        if(key == "regioes") return ["a",{"b":["b1","b2","b3"]},"c"];
        else return ["a","b","c"];
    }
}

var google={
    script:{
        run:{
            withFailureHandler: function(handler){
                this.errorHandler = handler;
                return this;
            },
            withSuccessHandler: function(handler){
                this.successHandler = handler;
                return this;
            }
        }
    }
}
for(func in service){
    google.script.run[func] = function(...params){
        try{
            var result  = service[func](params);
            google.script.run.successHandler(result);
        }catch(error){
            google.script.run.errorHandler(error);
        }
    }
}