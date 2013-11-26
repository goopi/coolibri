'use strict';

(function(w){
  w.log = function(){
    if (w.console && console.log) {
      var a = ['[cooli]'].concat([].slice.call(arguments));
      console.log.apply(console, a);
    }
  };

  w.qid = function(){
    return document.getElementById(arguments[0]);
  };

  w.qcl = function(){
    return document.getElementsByClassName(arguments[0])[0];
  };

  // w.onmousedown = function(e){
  //   log('Mouse: (' + e.clientX + ', ' + e.clientY + ')');
  // }
})(window);
