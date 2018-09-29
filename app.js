/*
Lista AVLs e CAN/MID desconectados
*/

var request = require("request");
var equipfunc = require('./equipamento.js');
var alarmefunc = require('./alarmes.js');



var fs = require('fs');
var bases = JSON.parse(fs.readFileSync('bases.json', 'utf8'));


var RelAtivos = {
    EquipamentosConectados : false,
    AlarmesTotalDia : true
};


// Varre as bases de Dashboard cadastradas
for(var base in bases){
    var dbBase = bases[base];

    if(RelAtivos.EquipamentosConectados){
        equipfunc.Req(request,dbBase,base);
    }
    if(RelAtivos.AlarmesTotalDia){
        alarmefunc.Req(request,dbBase,base);
    }



}