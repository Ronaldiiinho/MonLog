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

function Req(request, dbBase, base){
    var host = dbBase["host"];
    var porta = dbBase["porta"];
    var chave = dbBase["chave"];
    var dbNome = dbBase["nome_banco"];



    // Relatório de Equipamentos Conectados/Desconectados
    var postBody = {
        "Relatorio": "Suporte Produto - Firmware",
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
            avl : 0,
            can : 0,
            avl_off : 0,
            can_off : 0
        };
        
        if(body.erro){
            console.log(this.base + ': ERRO!');
            statistic.erro = body.erro;
            return statistic;
        }else{
            if(body.Dados){
                for(var registro in body.Dados){
                    var dbRegistro = body.Dados[registro];
                    statistic.avl++;
                    if(dbRegistro[6] == "Desconectado"){
                        var avl = {
                            base:this.base,
                            motivo: 'AVL_OFFLINE',
                            placa:dbRegistro[1],
                            avl:dbRegistro[3]
                        };
                        avl_offline.push(avl);
                        statistic.avl_off++;
                    }
                    if(dbRegistro[7]){ // Possui CAN
                        statistic.can++;
                        if(dbRegistro[10] == "Desconectado" || dbRegistro[10] == "AVL desconectado"){
                            var can = {
                                base:this.base,
                                motivo: 'CAN_OFFLINE',
                                placa:dbRegistro[1],
                                avl:dbRegistro[3],
                                can: dbRegistro[7]
                            };
                            can_offline.push(can);
                            statistic.can_off++;
                        }
                    }
                //console.log(this.base,",",dbRegistro[3],",",dbRegistro[1],",",dbRegistro[2],",",dbRegistro[7],",",dbRegistro["Coletor"],",",dbRegistro[0]);
                }
           }else{
                for(var registro in body){
                    var dbRegistro = body[registro];
                    statistic.avl++;
                    if(dbRegistro["AVL - Status"] == "Desconectado"){
                        var avl = {
                            base:this.base,
                            motivo: 'AVL_OFFLINE',
                            placa:dbRegistro["Placa"],
                            avl:dbRegistro["AVL"]
                        };
                        avl_offline.push(avl);
                    }
                    if(dbRegistro["CAN"]){
                        statistic.can++;
                        if(dbRegistro["CAN - Status"] == "Desconectado"){
                            var can = {
                                base:this.base,
                                motivo: 'CAN_OFFLINE',
                                placa:dbRegistro["Placa"],
                                avl:dbRegistro["AVL"],
                                can: dbRegistro["CAN"]
                            };
                            can_offline.push(can);
                            statistic.can_off++;
                        }
                    }
                    //console.log(this.base,",",dbRegistro["AVL"],",",dbRegistro["Placa"],",",dbRegistro["Modelo"],",",dbRegistro["CAN"],",",dbRegistro["Coletor"],",",dbRegistro["Identificador"]);
                }
            }
        }
        console.log(this.base + ':' + JSON.stringify(statistic));

        mailfunc.EnviaEquip(sprintf,statistic);
    });
}
module.exports = {
    Req: Req
  };