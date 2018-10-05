/*
  Format Mail


    var statistic = {
        avl : 0,
        can : 0,
        avl_off : 0,
        can_off : 0 };
*/

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ronaldo.sella@gmail.com',
    pass: 'Senha1243'
  }
});


function EquipStatToHTML(sprintf,stat) {

    var html = '<table border=1><tr><th colspan=4>'+stat.base+'</th></tr>';
    var d1 = Date.parse('today');
    if(stat.erro){
      html += '<tr><td colspan=4>Erro: ' + stat.erro + '</td></tr>';
    }else{
      html += '<tr><th colspan=2>AVL</th><th colspan=2>CAN/MID</th></tr>';
      html += '<tr><td>Total</td><td>Desconectado</td><td>Total</td><td>Desconectado</td></tr>';
      html += '<tr><td>'+stat.avl+'</td><td>'+stat.avl_off+'</td><td>'+stat.can+'</td><td>'+stat.can_off+'</td></tr>';
      html += '<tr><td colspan=2>'+sprintf("%d",0.5+100*stat.avl_off/stat.avl)+'%</td><td colspan=2>'+sprintf("%d",0.5+100*stat.can_off/stat.can)+'%</td></tr>';
      html += '<tr><td colspan=4>Gerado em:' + d1.toString('d/MM/yyyy') + '</td></tr>';
    }
    html += '</table>';
    return html;
  }
  
  
  function EnviaEquip(sprintf,statistic) {
    var mailOptions = {
      from: 'ronaldo.sella@gmail.com',
      to: 'ronaldo.sella@inlog.com.br',
      subject: 'Equipamentos Desconectados: ' + statistic.base,
      html: EquipStatToHTML(sprintf, statistic)
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });  
  }

  function AlarmesStatToHTML(sprintf,stat) {

    var d1 = Date.parse('today');
    var html = '<table border=1><tr><th colspan=2>'+stat.base+ ': ' + stat.alarmes +'</th></tr>';
    if(stat.erro){
      html += '<tr><td colspan=4>Erro: ' + stat.erro + '</td></tr>';
    }else{
      html += '<tr><th>Veículos: '+ stat.alarmes_veiculo + '</th><th>Operacionais: '+ stat.alarmes_operacional + '</th></tr>';

      html += '<tr><td>';
      for(var alarmev in stat.desc_alarmes_veiculo){
        html += '<b>' + stat.desc_alarmes_veiculo[alarmev].tipo + '</b>: ' + stat.desc_alarmes_veiculo[alarmev].total + '<br>'
      }
      html += '</td><td>';
      for(var alarmeo in stat.desc_alarmes_operacao){
        html += '<b>' + stat.desc_alarmes_operacao[alarmeo].tipo + '</b>: ' + stat.desc_alarmes_operacao[alarmeo].total + '<br>'
      }
      html += '</td></tr>';
      html += '<tr><td colspan=4>Gerado em:' + d1.toString('d/MM/yyyy') + '</td></tr>';
      html += '<tr><td colspan=4>Dados entre:' + stat.min_data + ' e ' + stat.max_data + '</td></tr>';
    }
    html += '</table>';
    return html;
  }
  
  
  function EnviaAlarmes(sprintf,statistic) {
    var mailOptions = {
      from: 'ronaldo.sella@gmail.com',
      to: 'ronaldo.sella@inlog.com.br',
      subject: 'Alarmes: ' + statistic.base,
      html: AlarmesStatToHTML(sprintf, statistic)
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });  
  }

  
  module.exports = {
    EquipamentoHTMLBody: EquipStatToHTML,
    EnviaEquip: EnviaEquip,
    AlarmesHTMLBody: AlarmesStatToHTML,
    EnviaAlarmes: EnviaAlarmes
  };