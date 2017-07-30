"use strict";

var Imported = Imported || {};
Imported.Rivington = true;

var Rivington = Rivington || {};
//Test
/*:
* @plugindesc Helps with the creation of Foraging and Farming Event Creation.
* @author RivingtonDown
*
* @param ---Scavenger---
* @default
*
* @param ScavengerActor
* @desc Actor ID of the character with the Forager Job
* Default 0
* @default 0
*
* @param ScavengerId
* @desc Class ID of the Forager Job
* Default 0
* @default 0
*
* @param ---Farmer---
* @default
*
* @param FarmerActor
* @desc Actor ID of the character with the Farmer Job
* Default 0
* @default 0
*
* @param FarmerId
* @desc Class ID of the Farmer Job
* Default 0
* @default 0
*
* @param ---Cook---
* @default
*
* @param CookActor
* @desc Actor ID of the character with the Cook Job
* Default 0
* @default 0
*
* @param CookId
* @desc Class ID of the Cook Job
* Default 0
* @default 0
*
* @param ---Carpenter---
* @default
*
* @param CarpenterActor
* @desc Actor ID of the character with the Carpenter Job
* Default 0
* @default 0
*
* @param CarpenterId
* @desc Class ID of the Carpenter Job
* Default 0
* @default 0
*

@help

Harvest_Manager
by: RivingtonDown

*/

(function () {
  Rivington.parameters = PluginManager.parameters('Rivington');

  Rivington.GameSystem_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function () {
    Rivington.GameSystem_initialize.call(this);
    //On Startup

  };

  Rivington.DataManager_onLoad = DataManager.onLoad;
  DataManager.onLoad = function (object) {
    Rivington.DataManager_onLoad.call(this, object);
    if (object === $dataMap) {
      //On Startup
    }
  };

  Rivington.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    Rivington.Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'hvSense') this.instincts('sense', args);
    if (command === 'hvGather') this.harvest('Gather', args);
    if (command === 'hvTree') this.harvest('Tree', args);
    if (command === 'hvPlant') this.harvest('Plant', args);
  };

  var hvJobs = [];
  hvJobs[parseInt(Rivington.parameters['ScavengerId'])] = { 'class': 'Scavenger', 'actor': parseInt(Rivington.parameters['ScavengerActor']) };
  hvJobs[parseInt(Rivington.parameters['FarmerId'])] = { 'class': 'Farmer', 'actor': parseInt(Rivington.parameters['FarmerActor']) };
  hvJobs[parseInt(Rivington.parameters['CookId'])] = { 'class': 'Cook', 'actor': parseInt(Rivington.parameters['CookActor']) };
  hvJobs[parseInt(Rivington.parameters['CarpenterId'])] = { 'class': 'Carpenter', 'actor': parseInt(Rivington.parameters['CarpenterActor']) };

  Rivington.parseComment = function (command, args, eventId) {
    //Create harvestable event by parsing <createHarvest> comment
    var evCmds = $gameMap.event(eventId).event().pages[$gameMap.event(eventId).findProperPageIndex()].list; //find all commands on this event's current page
    var evComments = _.filter(evCmds, function (o) {
      return o.code === 108 || o.code === 408;
    }); //find all comments within this page
    //Amongst any and all comments find the start and end of the <hvCommand> comment
    var startKey,
        endKey = 0;
    _.forEach(evComments, function (value, key) {
      if (value.parameters[0] == '<hv' + command + '>') {
        startKey = key;
      }
      if (value.parameters[0] == '</hv' + command + '>') {
        endKey = key;
      }
    });
    evComments = _.filter(evComments, function (value, key) {
      return key > startKey && key < endKey;
    }); //filter the comments to only everything inbetween <createHarvest>
    //build a clean harvest js object based on that comment's strings
    var hvObject = {};
    _.forEach(evComments, function (o) {
      var hvKey = o.parameters[0].split(':')[0];
      var hvValue = o.parameters[0].split(':')[1];
      if (hvValue.split(',')[1]) {
        hvObject[hvKey] = parseInt(hvValue.split(',')[0]);
        hvObject[hvKey + '2'] = parseInt(hvValue.split(',')[1]);
      } else {
        hvObject[hvKey] = parseInt(hvValue);
      }
    });

    return hvObject;
  };

  Rivington.hvMessage = function (position, msg, audio) {
    $gameMessage.setPositionType(position); //set message to screen middle
    if (audio) {
      AudioManager.playSe({ name: audio, volume: 100, pitch: 100, pan: 0, pos: 0 });
    }
    $gameMessage.add(msg);
  };

  Rivington.randomInc = function (min, max) {
    min = Math.ceil(parseInt(min));
    max = Math.floor(parseInt(max));
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  Rivington.calculateItems = function (hvObject) {
    AudioManager.playSe({ name: "Move4", volume: 20, pitch: 180, pan: 0, pos: 0 });
    $gameParty.gainItem($dataItems[hvObject.item], hvObject.yield);
    if (hvObject.item2) {
      $gameParty.gainItem($dataItems[hvObject.item2], hvObject.yield2);
    }
  };
  Rivington.autoColorText = function (hvObject) {
    if (!$gameSystem._AC_setting[$dataSkills[hvObject.skill].name]) {
      $gameSystem.add_AC_Entry($dataSkills[hvObject.skill].name, 11); //add skill to autocolor
    }
    if (!$gameSystem._AC_setting[$dataClasses[hvObject.job].name]) {
      $gameSystem.add_AC_Entry($dataClasses[hvObject.job].name, 14); //add class to autocolor
    }
    if (hvObject.tool && !$gameSystem._AC_setting[$dataItems[hvObject.tool].name]) {
      $gameSystem.add_AC_Entry($dataItems[hvObject.tool].name, 10); //add tool to autocolor
    }
  };
  Game_Interpreter.prototype.instincts = function (command, args) {
    //Search map for all events with hv comments

    //Add graphical effect to those events
  };
  Game_Interpreter.prototype.harvest = function (command, args) {
    if (!args) return;
    //build a clean object by parsing through the comment
    var hvObject = Rivington.parseComment(command, args, this._eventId);
    command = command.toLowerCase();
    //Parse the plugin command arguments into a clean js object
    hvObject['skill'] = parseInt(args[1]) || 1;
    hvObject['jp'] = parseInt(args[2]) || 1;
    hvObject['switch'] = args[3] || null;
    //Calculate the yield, whether or not it yields multiple items or a random amount of those items
    hvObject['yield'] = hvObject.item2 ? args[0].split(',')[0] : args[0] || 1;
    hvObject['yield2'] = hvObject.item2 ? args[0].split(',')[1] : null;
    hvObject['yield'] = hvObject.yield.split('-').length > 1 ? Rivington.randomInc(hvObject.yield.split('-')[0], hvObject.yield.split('-')[1]) : parseInt(hvObject.yield);
    if (hvObject.yield2) {
      hvObject['yield2'] = hvObject.yield2.split('-').length > 1 ? Rivington.randomInc(hvObject.yield2.split('-')[0], hvObject.yield2.split('-')[1]) : parseInt(hvObject.yield2);
    }
    console.log(hvObject);

    var thisActor = hvJobs[hvObject.job].actor; //store the acting actor id
    var currentJobLvl = $gameActors.actor(thisActor).jpLevel(hvObject.job); //store the actors initial job level

    //Make sure Job, Skill, and Tool names are colored in message boxes
    Rivington.autoColorText(hvObject);

    if (currentJobLvl >= hvObject.level) {
      if ($gameActors.actor(thisActor).isLearnedSkill(hvObject.skill)) {
        if ($gameParty.hasItem($dataItems[hvObject.tool], true) || !hvObject.tool) {
          if (hvObject.switch) {
            $gameSelfSwitches.setValue([this._mapId, this._eventId, hvObject.switch], true);
          }
          Rivington.calculateItems(hvObject);

          $gameActors.actor(thisActor).gainJp(hvObject.jp, hvObject.job);
          $gameSystem.createPopup(231, 'left', $dataClasses[hvObject.job].name + ' +' + hvObject.jp + ' JP');
          if ($gameActors.actor(thisActor).jpLevel(hvObject.job) > currentJobLvl) {
            var msg = $dataClasses[hvObject.job].name + ' is now level ' + $gameActors.actor(thisActor).jpLevel(hvObject.job) + '!';
            Rivington.hvMessage(2, msg, 'Saint5');
          }
        } else {
          var _msg = 'No one in the party has a ' + $dataItems[hvObject.tool].name + '.';
          Rivington.hvMessage(2, _msg);
        }
      } else {
        var _msg2 = 'No one has learned the ' + $dataSkills[hvObject.skill].name + ' skill.';
        Rivington.hvMessage(2, _msg2);
      }
    } else {
      var _msg3 = 'Requires ' + $dataClasses[hvObject.job].name + ' level ' + hvObject.level + '.';
      Rivington.hvMessage(2, _msg3);
    }
  };
})();
