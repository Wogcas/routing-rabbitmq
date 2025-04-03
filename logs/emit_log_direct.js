#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0; // Manejar errores de conexión
  }

  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1; // Manejar errores al crear el canal
    }

    // Definir el nombre del exchange
    var exchange = 'direct_logs';

    // Declarar un exchange de tipo 'direct'
    channel.assertExchange(exchange, 'direct', {
      durable: false // Los mensajes no se persisten
    });

    // Analizar los argumentos de la línea de comandos
    var args = process.argv.slice(2);
    var severities = args.length > 0 ? args : ['info', 'warning', 'error']; // Claves de enrutamiento posibles

    // Ciclo while para enviar mensajes constantemente
    let count = 0;
    setInterval(() => {
      let severity = severities[count % severities.length]; // Alternar entre las severidades
      let msg = `Mensaje ${count} para ${severity}`;
      channel.publish(exchange, severity, Buffer.from(msg));
      console.log(" [x] Enviado %s: '%s'", severity, msg);
      count++;
    }, 1000); // Enviar un mensaje cada segundo
  });
});
