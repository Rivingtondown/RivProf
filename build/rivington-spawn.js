"use strict";

var Imported = Imported || {};
Imported.Rivington_Spawn = true;

var Rivington = Rivington || {};
Rivington.Spawn = Rivington.Spawn || {};
/*:
* @plugindesc Automated spawning extension for Rivington Harvest.
* @author RivingtonDown
*
* @param Region Spawning
* @desc Automate event spawning in designated regions. Requires Orange Custom Events.
* Default true
* @default true
*
* @param EventMap ID
* @desc ID of map to copy events from. Requires Orange Custom Events.
* Default 0
* @default 0
*
* @param Spawn Tracking Variable
* @desc Designated variable to keep track of map spawns.
* Default 0
* @default 0
*
@help

Rivington_Spawn
by: RivingtonDown

*/

(function () {
  Rivington.Parameters = PluginManager.parameters('Rivington_Spawn');
  Rivington.Param = Rivington.Param || {};

  Rivington.Param.hvSpawn = Boolean(Rivington.Parameters['Region Spawning']);
  Rivington.Param.hvEventMap = Number(Rivington.Parameters['EventMap ID']);
  Rivington.Param.hvSpawnVar = Number(Rivington.Parameters['Spawn Tracking Variable']);

  var hvSpawns = [];
  var spawnedTile = false;
  var hvEvents = [];

  Game_Map.prototype.copyEventFromMapToRegionA = function (mapIdOrigin, eventIdOrigin, regionId, amount, temporary, newIndex, callback) {
    for (var i = 0; i < amount; i++) {
      var tile = this.getRandomRegionTile(regionId);
      if (tile !== undefined) {
        if (spawnedTile && spawnedTile.x == tile.x && spawnedTile.y == tile.y) {
          console.log('Can\'t spawn ' + eventIdOrigin + ' at X:' + tile.x + ' Y:' + tile.y);
        } else {
          console.log('Spawned ' + eventIdOrigin + ' at X:' + tile.x + ' Y:' + tile.y);
          this.copyEventFrom(mapIdOrigin, eventIdOrigin, tile.x, tile.y, temporary, newIndex, callback);
          spawnedTile = tile;
        }
      }
    }
    spawnedTile = false;
  };

  Rivington.Spawn.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
  DataManager.isDatabaseLoaded = function () {

    if (!Rivington.Spawn.DataManager_isDatabaseLoaded.call(this)) return false;
    if (!Rivington.Spawn._loaded_RivingtonItemTags) {
      this.setDatabaseLengths();
      for (var n = 1; n < $dataItems.length; n++) {
        var obj = $dataItems[n];
        var notedata = obj.note.split(/[\r\n]+/);

        obj.infoEval = '';
        obj.hvEval = '';
        var evalMode = 'none';

        for (var i = 0; i < notedata.length; i++) {
          var line = notedata[i];
          if (line.match(/<(?:RIVINGTON HARVEST)>/i)) {
            evalMode = 'hv eval';
          } else if (line.match(/<\/(?:RIVINGTON HARVEST)>/i)) {
            evalMode = 'none';
          } else if (evalMode === 'hv eval') {
            if (obj.hvEval !== '') obj.hvEval += '\n';
            obj.hvEval = {
              'name': line.split(",")[0].split(":").length > 1 ? line.split(",")[0].split(":")[0] : obj.name.toLowerCase(),
              'itemId': obj.id,
              'spawnTime': line.split(",")[1].split("-").length > 1 ? line.split(",")[1].split("-")[1] : "morning",
              'eventId': line.split(",")[0].split(":").length > 1 ? line.split(",")[0].split(":")[1] : line.split(",")[0],
              'spawnRegion': line.split(",")[1].split("-").length > 1 ? line.split(",")[1].split("-")[0] : line.split(",")[1]
            };
            if (obj.hvEval.spawnTime == "morning" || obj.hvEval.spawnTime == "day") {
              obj.hvEval.spawnTime = [4, 7];
            }
            if (obj.hvEval.spawnTime == "night" || obj.hvEval.spawnTime == "midnight") {
              obj.hvEval.spawnTime = [5, 6];
            }
            hvEvents.push(obj.hvEval);
          }
        }
      }
      Rivington.Spawn._loaded_RivingtonItemTags = true;
    }
    return true;
  };

  Rivington.Spawn.Scene_Map_start = Scene_Map.prototype.start;
  Scene_Map.prototype.start = function () {
    Rivington.Spawn.Scene_Map_start.call(this);
    hvSpawns = $gameVariables.value(Rivington.Param.hvSpawnVar) || [];
    if (!hvSpawns || hvSpawns == "" || hvSpawns.length == 0) {
      _.forEach(_.compact($dataMapInfos), function (o) {
        var MapObj = {};
        MapObj.id = o.id;
        MapObj.name = o.name;
        MapObj.hvEvents = hvEvents;
        _.forEach(MapObj.hvEvents, function (o) {
          o.spawned = false;
        });
        hvSpawns[o.id] = MapObj;
      });
    }
    hvSpawns[$gameMap.mapId()].forage = $dataMap.meta.forage ? $dataMap.meta.forage.trim().split(',') : null;
    if (Rivington.Param.hvSpawn) {
      Rivington.Spawn.spawnHarvest(hvSpawns);
    }
  };

  Rivington.Spawn.spawnHarvest = function (hvSpawns) {
    var hvMap = hvSpawns[$gameMap.mapId()];
    //Clear Common Events
    for (var i = 0; i < $gameMap._events.length; i++) {
      if (!!$gameMap._events[i] && $gameMap._events[i]._erased) {
        $gameMap._events[i] = undefined;
      }
    }

    if (hvMap.forage) {
      console.log(hvMap);
      _.forEach(hvMap.hvEvents, function (hvE, index) {
        if (hvMap.forage.indexOf(hvE.name) != -1 && hvE.spawned === false) {
          console.log(hvE.name + ' ' + ($gameSwitches.value(hvE.spawnTime[0]) === true || $gameSwitches.value(hvE.spawnTime[1]) === true));
          if ($gameSwitches.value(hvE.spawnTime[0]) === true || $gameSwitches.value(hvE.spawnTime[1]) === true) {
            var spawnAmount = Math.min($gameMap.getRegionTileList(parseInt(hvE.spawnRegion)).length, 2);
            $gameMap.copyEventFromMapToRegionA(Rivington.Param.hvEventMap, parseInt(hvE.eventId), parseInt(hvE.spawnRegion), spawnAmount, false);
            console.log('spawned ' + hvE.name);
            hvSpawns[$gameMap.mapId()].hvEvents[index].spawned = true;
          }
        }
      });
      $gameVariables.setValue(Rivington.Param.hvSpawnVar, hvSpawns);
    }
  };
})();
