/*
Lista AVLs e CAN/MID desconectados
*/

var nodemailer = require('nodemailer');
var mailfunc = require('./mail.js');
var sprintf = require("sprintf-js").sprintf;
const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;



function IncTipoAlarme (stat, veiculo, tipo,status, veiculo_id){
    var resumo;
    var resumo_veiculo;
    if(veiculo.includes("Ve")){
        resumo = stat.desc_alarmes_veiculo;
        stat.alarmes_veiculo++;
        if(status.includes("Pen")){
            stat.veiculo.pendentes++;
        }else if(status.includes("Inv")){
            stat.veiculo.invalidos++;
        }else{
            stat.veiculo.validos++;
        }
    }else{
        resumo = stat.desc_alarmes_operacao;
        stat.alarmes_operacional++;
        if(status.includes("Pen")){
            stat.operacao.pendentes++;
        }else if(status.includes("Inv")){
            stat.operacao.invalidos++;
        }else{
            stat.operacao.validos++;
        }
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
    var SalvouVeiculo = false;

    for(var veic_id in stat.veiculos){
        if(veiculo_id ==  stat.veiculos[veic_id].id){
            stat.veiculos[veic_id].total++;
            SalvouVeiculo = true;
        }
    }
    if(!SalvouVeiculo){
        var nitem = {
            id : veiculo_id,
            total : 1
        };
        stat.veiculos.push(nitem);
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
            desc_alarmes_operacao : [],
            veiculos : [],
            veiculo : {
                pendentes : 0,
                validos : 0,
                invalidos : 0
            },
            operacao : {
                pendentes : 0,
                validos : 0,
                invalidos : 0
            },
        };
        console.log(base + " REQ Concluída");
        if(error){
            statistic.erro = error.message;
        } else if(body.erro){
            statistic.erro = body.erro;
        }else{
            if(body.Dados){
                    const fields = ["Descrição de Alarmes","Tipo do Alarme", "Identificador do Veículo","Descrição Tipo Alarme","Descrição Status Alarme","Data Ocorrência"];
                    const json2csvParser = new Json2csvParser({ fields, delimiter: ',' });
                    const tsv = json2csvParser.parse(body.Dados);
                    fs.writeFile(statistic.base + ".csv", tsv, function(err) {
                        if(err) {
                            return console.log(err);
                        }
                    }); 
                    for(var registro in body.Dados){
                    var dbRegistro = body.Dados[registro];
                    statistic.alarmes++;
                    if(Date.compare(Date.parse(dbRegistro[4]),Date.parse(statistic.max_data)) > 0){
                        statistic.max_data = dbRegistro[4];
                    }
                    if(Date.compare(Date.parse(dbRegistro[4]),Date.parse(statistic.min_data)) < 0){
                        statistic.min_data = dbRegistro[4];
                    }
                    IncTipoAlarme(statistic,dbRegistro[2],dbRegistro[0],dbRegistro[3],dbRegistro[4]);
                }
           }else{
                const fields = ["Descrição de Alarmes","Tipo do Alarme", "Identificador do Veículo","Descrição Tipo Alarme","Descrição Status Alarme","Data Ocorrência"];
                const json2csvParser = new Json2csvParser({ fields, delimiter: ',' });
                const tsv = json2csvParser.parse(body);
                fs.writeFile(statistic.base + ".csv", tsv, function(err) {
                    if(err) {
                        return console.log(err);
                    }

                }); 
                for(var registro in body){
                    var dbRegistro = body[registro];
                    statistic.alarmes++;
                    if(Date.compare(Date.parse(dbRegistro["Data Ocorrência"]),Date.parse(statistic.max_data)) > 0){
                        statistic.max_data = dbRegistro["Data Ocorrência"];
                    }
                    if(Date.compare(Date.parse(dbRegistro["Data Ocorrência"]),Date.parse(statistic.min_data)) < 0){
                        statistic.min_data = dbRegistro["Data Ocorrência"];
                    }
                    IncTipoAlarme(statistic,dbRegistro["Descrição Tipo Alarme"],dbRegistro["Descrição de Alarmes"],dbRegistro["Descrição Status Alarme"],dbRegistro["Identificador do Veículo"]);
                }
            }
        }
        console.log(statistic.base + " Concluído");
        //mailfunc.EnviaAlarmes(sprintf,statistic);
    });
}
module.exports = {
    Req: Req
  };