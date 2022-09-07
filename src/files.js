var bodyParser = require('body-parser')

module.exports = function (RED) {
  var requestSize = '50mb'

  function Node (config) {
    RED.nodes.createNode(this, config);
    var node = this;

    // RED.httpAdmin.get('/node-red-files/status', function (req, res) {
    //   var n = RED.nodes.getNode(req.query.id)
    //   var status = {};
    //   if ('true' == req.query.status) {
    //     status = {fill:'red', shape:'dot', text:'sending file...'}
    //   }
    //   if (n) {
    //     n.status(status);
    //   }
    //   res.json({});
    // });


    RED.httpAdmin.post('/node-red-files/:id', bodyParser.raw({ type: '*/*', limit: requestSize }), function(req,res) {
        var node = RED.nodes.getNode(req.params.id);
        var payload = {payload: req.body};
        if (req.query.topic) {
            payload['topic'] = req.query.topic
        }

        if (node != null) {
            try {
                node.receive(payload)
                node.status({})
                res.sendStatus(200)
            } catch(err) {
                res.sendStatus(500)
                node.error(RED._("inject-file.failed", { error: err.toString() }))
            }
        } else {
            res.status(404).send("no node found")
        }
    })

    this.on('input', function (msg) {
      if(msg.payload !== '') {
        node.send(msg)
      }
    })
  }
  RED.nodes.registerType('files', Node)
};
