(function() {
    var _path = require('path');
    var _logger = require(_path.resolve(__dirname, 'Node-Logger', 'app.js'));

    var _wol = require('wake_on_lan');
    var _express = require('express');
    var _app = _express();

    const SETTINGS = readJson(_path.resolve(__dirname, 'settings.json'));
    const MC_SERVER_RESPONSE_PARAM = 'mc';

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

        _wol.wake(device.MAC, (err) => {
            if (err) {
                _logger.Error.Async('WOL error', err);
                res.send('<div>ERROR: ' + err + '</div>');
            }

            else {
                var customResponse = req.params.customResponse;
                if (customResponse) {
                    var message;
                    if (customResponse.toLowerCase() === MC_SERVER_RESPONSE_PARAM.toLowerCase()) {
                        _logger.Info.Async('Waking Minecraft server');
                        message = '<div>Server is waking from sleep; please reconnect in a few minutes.</div>\n<div>You can now close this page.</div>';
                    }
                    else
                        message = '<div>' + customResponse + '</div>';

                    res.send(message);
                }
                else {
                    _logger.Info.Async('Packet sent', 'IP: ' + device.IP + ', MAC Address: ' + device.MAC);
                    res.send('<div>Packet sent.</div>\n<ul>\n<li>IP: ' + device.IP + '</li>\n<li>MAC: ' + device.MAC + '</li>\n</ul>');
                }

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