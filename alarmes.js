/*
Lista AVLs e CAN/MID desconectados
*/

var nodemailer = require('nodemailer');
var mailfunc = require('./mail.js');
var sprintf = require("sprintf-js").sprintf;


function IncTipoAlarme (stat, veiculo, tipo,status){
    var resumo;
    if(veiculo == "Veiculo"){
        resumo = stat.desc_alarmes_veiculo;
        stat.alarmes_veiculo++;
    }else{
        resumo = stat.desc_alarmes_operacao;
        stat.alarmes_operacional++;
    }
    var Salvou = false;

    for(var tipo_resumo in resumo){
        if(tipo == resumo[tipo_resumo].tipo){
            resumo[tipo_resumo].total++;
            Salvou = true;
        }
    }
    if(!Salvou){
        var nitem = {
            tipo : tipo,
            total : 1
        };
        resumo.push(nitem);
    }
}


function Req(request, dbBase, base){
    var host = dbBase["host"];
    var porta = dbBase["porta"];
    var chave = dbBase["chave"];
    var dbNome = dbBase["nome_banco"];



    // Relatório de Alarmes
    var postBody = {
        "Relatorio": "MonAlarmes",
        "Autenticacao": chave,
        "NomeBanco": dbNome,
        "Formato": "chavevalor"
    };

    var options = {
        uri: host,
        base : base,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: postBody
    };

    request(options, function(error, response, body) {
        var avl_offline = [];
        var can_offline = [];

        var statistic = {
            base : this.base,
            erro : '',
            alarmes : 0,
            alarmes_veiculo : 0,
            alarmes_operacional : 0,
            max_data : '2010-01-01',
            min_data : '2100-01-01',
            desc_alarmes_veiculo : [],
            desc_alarmes_operacao : []
        };

        if(error){
            console.log(this.base + ': ERRO!');
            statistic.erro = error.message;
        } else if(body.erro){
            console.log(this.base + ': ERRO!');
            statistic.erro = body.erro;
        }else{
            if(body.Dados){
                for(var registro in body.Dados){
                    var dbRegistro = body.Dados[registro];
                    statistic.alarmes++;
                    if(Date.compare(Date.parse(dbRegistro[4]),Date.parse(statistic.max_data)) > 0){
                        statistic.max_data = dbRegistro[4];
                    }
                    if(Date.compare(Date.parse(dbRegistro[4]),Date.parse(statistic.min_data)) < 0){
                        statistic.min_data = dbRegistro[4];
                    }
                    IncTipoAlarme(statistic,dbRegistro[2],dbRegistro[0],dbRegistro[3]);
                }
           }
        }
        mailfunc.EnviaAlarmes(sprintf,statistic);
    });
}
module.exports = {
    Req: Req
  };