/*
Lista AVLs e CAN/MID desconectados
*/

var nodemailer = require('nodemailer');
var mailfunc = require('./mail.js');
var sprintf = require("sprintf-js").sprintf;



var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ronaldo.sella@gmail.com',
      pass: 'Senha1243'
    }
  });

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
            max_data : '01/01/2010',
            min_data : '01/01/2120',
            desc_alarmes_veiculo : [],
            desc_alarmes_operacao : []
        };
        
        if(body.erro){
            console.log(this.base + ': ERRO!');
            statistic.erro = body.erro;
            return statistic;
        }else{
            if(body.Dados){
                for(var registro in body.Dados){
                    var dbRegistro = body.Dados[registro];
                    statistic.alarmes++;
                    if(Date(dbRegistro[5]) > Date(statistic.max_data)){
                        statistic.max_data = dbRegistro[5];
                    }
                    if(Date(dbRegistro[5]) < Date(statistic.min_data)){
                        statistic.min_data = dbRegistro[5];
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