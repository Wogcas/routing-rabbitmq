#!/usr/bin/env node

/**
 * The `amqp` module is used to interact with RabbitMQ, a message broker that 
 * implements the Advanced Message Queuing Protocol (AMQP). This module provides 
 * methods to connect to a RabbitMQ server, create channels, and send/receive messages.
 *
 * Key Concepts to Understand:
 * - **Exchanges**: Routing mechanisms that determine how messages are distributed to queues.
 * - **Bindings**: Links between exchanges and queues that define routing rules.
 * - **Direct Exchange**: A type of exchange where messages are routed to queues based on an exact match between the routing key and the queue's binding key.
 * - **Callback API**: The `amqplib/callback_api` module uses a callback-based approach for asynchronous operations.
 *
 * To use this module, ensure RabbitMQ is installed and running on your system.
 * Documentation: https://www.rabbitmq.com/documentation.html
 */
var amqp = require('amqplib/callback_api');

var args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Usage: receive_logs_direct.js [info] [warning] [error]");
  process.exit(1);
}

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var exchange = 'direct_logs';

    channel.assertExchange(exchange, 'direct', {
      durable: false
    });

    channel.assertQueue('', {
      exclusive: true
      }, function(error2, q) {
        if (error2) {
          throw error2;
        }
      console.log(' [*] Waiting for logs. To exit press CTRL+C');

      args.forEach(function(severity) {
        // Vincula la cola temporal al intercambio con una clave de enrutamiento específica (severity).
        channel.bindQueue(q.queue, exchange, severity);
      });

      channel.consume(q.queue, function(msg) {
        console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
      }, {
        noAck: true
      });
    });
  });
});