"use strict";

var Imported = Imported || {};
Imported.Rivington = true;

var Rivington = Rivington || {};

/*:
* @plugindesc Helps with the creation of Foraging and Farming Event Creation.
* @author RivingtonDown
*
* @help
*
*/
(function () {
  Rivington.parameters = PluginManager.parameters('Rivington');

  Rivington.GameSystem_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function () {
    Rivington.GameSystem_initialize.call(this);
    var hello = [{ 'id': 1, 'name': 'world' }];
    var thisMessage = _.find(hello, function (o) {
      return o.id == 1;
    });
    console.log('hello ' + thisMessage.name);
  };
})();
