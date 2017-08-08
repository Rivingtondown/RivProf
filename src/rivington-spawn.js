"use strict";

var Imported = Imported || {};
Imported.Rivington_Spawn = true;

var Rivington = Rivington || {};
Rivington.Spawn = Rivington.Spawn || {};
/*:
* @plugindesc Automated spawning extension for Rivington Harvest.
* @author RivingtonDown
*
* @param EventMap ID
* @desc ID of Event Map
* Default 0
* @default 0
*
@help

Harvest_Spawner
by: RivingtonDown

*/

(function () {
  Rivington.Spawn.parameters = PluginManager.parameters('Rivington_Spawn');

  var hvSpawns = [];
  var spawnedTile = false;
  var hvEvents = [];

  Game_Map.prototype.copyEventFromMapToRegionA = function(mapIdOrigin, eventIdOrigin, regionId, amount, temporary, newIndex, callback) {
    for (let i = 0; i < amount; i++) {
      var tile = this.getRandomRegionTile(regionId);
      if (tile !== undefined) {
        if(spawnedTile && (spawnedTile.x == tile.x && spawnedTile.y == tile.y)) {
          console.log(`Can't spawn ${eventIdOrigin} at X:${tile.x} Y:${tile.y}`);
        } else {
          console.log(`Spawned ${eventIdOrigin} at X:${tile.x} Y:${tile.y}`)
          this.copyEventFrom(mapIdOrigin, eventIdOrigin, tile.x, tile.y, temporary, newIndex, callback);
          spawnedTile = tile;
        }
      }
    }
    spawnedTile = false;
  };

  Rivington.Spawn.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
  DataManager.isDatabaseLoaded = function() {

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
              'itemId':obj.id,
              'spawnTime': line.split(",")[1].split("-").length > 1 ?  line.split(",")[1].split("-")[1] : "morning",
              'eventId': line.split(",")[0].split(":").length > 1 ? line.split(",")[0].split(":")[1] : line.split(",")[0],
              'spawnRegion':line.split(",")[1].split("-").length > 1 ?  line.split(",")[1].split("-")[0] : line.split(",")[1]
            }
            if (obj.hvEval.spawnTime == "morning" || obj.hvEval.spawnTime == "day") {obj.hvEval.spawnTime = [4,7]}
            if (obj.hvEval.spawnTime == "night" || obj.hvEval.spawnTime == "midnight") {obj.hvEval.spawnTime = [5,6]}
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
      hvSpawns = $gameVariables.value(40) || [];
      if (!hvSpawns || hvSpawns == "" || hvSpawns == 0) {
        _.forEach(_.compact($dataMapInfos),(o) => {
          let MapObj = {};
          MapObj.id = o.id;
          MapObj.name = o.name;
          MapObj.hvEvents = hvEvents
          _.forEach(MapObj.hvEvents,(o)=>{
            o.spawned = false;
          })
          hvSpawns[o.id] = MapObj;
        })
      }
      hvSpawns[$gameMap.mapId()].forage = $dataMap.meta.forage ? $dataMap.meta.forage.trim().split(',') : null;
      Rivington.Spawn.spawnHarvest(hvSpawns);
  };

  Rivington.Spawn.spawnHarvest = function(hvSpawns) {
    var hvMap = hvSpawns[$gameMap.mapId()];

    //Clear Common Events
    for (let i = 0; i < $gameMap._events.length; i++) {
      if (!!$gameMap._events[i] && $gameMap._events[i]._erased) {
        $gameMap._events[i] = undefined;
      }
    }

    if (hvMap.forage) {
      console.log(hvMap);
      _.forEach(hvMap.hvEvents,(hvE,index) => {
        if (hvMap.forage.indexOf(hvE.name) != -1 && hvE.spawned === false) {
          console.log(`${hvE.name} ${$gameSwitches.value(hvE.spawnTime[0]) === true || $gameSwitches.value(hvE.spawnTime[1]) === true}`)
          if ($gameSwitches.value(hvE.spawnTime[0]) === true || $gameSwitches.value(hvE.spawnTime[1]) === true) {
            let spawnAmount = Math.min($gameMap.getRegionTileList(parseInt(hvE.spawnRegion)).length, 2);
            $gameMap.copyEventFromMapToRegionA(19,parseInt(hvE.eventId),parseInt(hvE.spawnRegion),spawnAmount,false);
            console.log(`spawned ${hvE.name}`);
            hvSpawns[$gameMap.mapId()].hvEvents[index].spawned = true;
          }
        }
      })
      $gameVariables.setValue(40, hvSpawns);
    }
  }
})();
