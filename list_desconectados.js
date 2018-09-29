/*

Lista AVLs e CAN/MID desconectados


*/

var request = require("request");

console.log("Iniciando");


var fs = require('fs');
var bases = JSON.parse(fs.readFileSync('bases.json', 'utf8'));
//console.log(bases);

var relatorio;

for(var base in bases){
    var dbBase = bases[base];
    var host = dbBase["host"];
    var porta = dbBase["porta"];
    var chave = dbBase["chave"];
    var dbNome = dbBase["nome_banco"];
    var postBody = {
        "Relatorio": "Suporte Produto - Firmware",
        "Autenticacao": chave,
        "NomeBanco": dbNome,
        "Formato": "chavevalor"};


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
       
       if(body.erro){
        console.log(this.base + ':' + JSON.stringify(body));
       }else{
           if(body.Dados){
            for(var registro in body.Dados){
                var dbRegistro = body.Dados[registro];
                 console.log(this.base,",",dbRegistro[3],",",dbRegistro[1],",",dbRegistro[2],",",dbRegistro[7],",",dbRegistro["Coletor"],",",dbRegistro[0]);
                }
           }else{
                for(var registro in body){
                    var dbRegistro = body[registro];
                    console.log(this.base,",",dbRegistro["AVL"],",",dbRegistro["Placa"],",",dbRegistro["Modelo"],",",dbRegistro["CAN"],",",dbRegistro["Coletor"],",",dbRegistro["Identificador"]);
                }
            }
        }
    });
}
//console.log("Finalizado");