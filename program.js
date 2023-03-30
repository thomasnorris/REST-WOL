const { arrayBuffer } = require('stream/consumers');

(function() {
    var _path = require('path');
    var _logger = require(_path.resolve(__dirname, 'Node-Logger', 'app.js'));

    var _wol = require('wake_on_lan');
    var _express = require('express');
    var _app = _express();

    const SETTINGS = readJson(_path.resolve(__dirname, 'settings.json'));

    var _devices = SETTINGS.Devices;
    var _endpoints = SETTINGS.Endpoints;

    _app.get(_endpoints.Wake, (req, res) => {
        res.set('Content-Type', 'text/html');
        var name = req.params.name;
        if (name === undefined) {
            _logger.Warning.Async('Device name not supplied');
            res.send('<div>Device name not supplied.</div>\n<div>Use "/wake/{name}" and supply the device name.</div>');
            return;
        }

        var device;
        Object.keys(_devices).forEach((deviceName) => {
            if (deviceName.toLowerCase() === name.toLowerCase())
                device = _devices[deviceName];
        });

        if (!device) {
            _logger.Warning.Async('Device not found', 'Device name supplied: ' + name);
            var html = '<div>Device \"' + name + '\" not found.</div>\n<div>See \"' + _endpoints.Devices + '\" for available devices.';
            res.send(html);
            return;
        }

        var mac = device.MAC;

        // send reverse of packet for sleep-on-lan
        var sleep = req.params.sleep;
        if (sleep) {
           mac = mac.split(':').reverse().join(':');
        }

        _wol.wake(mac, (err) => {
            if (err) {
                _logger.Error.Async('WOL error', err);
                res.send('<div>ERROR: ' + err + '</div>');
            }

            else {
                _logger.Info.Async('Packet sent', 'IP: ' + device.IP + ', MAC Address: ' + mac);
                res.send('<div>Packet sent.</div>\n<ul>\n<li>IP: ' + device.IP + '</li>\n<li>MAC: ' + mac + '</li>\n</ul>');
            }
        });
    });

    _app.get(_endpoints.Devices, (req, res) => {
        _logger.Info.Async('Get devices endpoint queried');
        res.send(_devices);
    });

    _app.set('json spaces', 4);
    _app.listen(SETTINGS.Port);

    _logger.Init.Async('Server ready', 'localhost:' + SETTINGS.Port);

    function readJson(filePath) {
        var fs = require('fs');
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
})();