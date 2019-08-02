(function() {
    const LISTEN_PORT = 1000;
    const SETTINGS = './settings.js';
    const MC_SERVER_RESPONSE_PARAM = 'mc';

    var _wol = require('wake_on_lan');
    var _express = require('express')();
    var _settings = require(SETTINGS);
    var _devices = _settings.GetDevices();
    var _endpoints = _settings.GetEndpoints();

    _express.get(_endpoints.WAKE, (req, res) => {
        res.set('Content-Type', 'text/html');
        var name = req.params.name;
        if (name === undefined) {
            res.send('<div>Device name not supplied.</div>\n<div>Use "/wake/{name}" and supply the device name.</div>');
            return;
        }

        var device = _devices.filter((device) => {
            return device.name.toLowerCase() === name.toLowerCase();
        })[0];

        if (device === undefined) {
            var html = '<div>Device not found.</div>\n<div>See \"' + _endpoints.DEVICES + '\" for available devices.';
            res.send(html);
            return;
        }

        _wol.wake(device.mac, (err) => {
            if (err)
                res.send('<div>ERROR: ' + err + '</div>');
            else {
                var customResponse = req.params.customResponse;
                if (customResponse) {
                    var message;
                    if (customResponse.toLowerCase() === MC_SERVER_RESPONSE_PARAM.toLowerCase())
                        message = '<div>Server is waking from sleep; please reconnect in a few minutes.</div>\n<div>You can now close this page.</div>';
                    else
                        message = '<div>' + customResponse + '</div>';

                    res.send(message);
                }
                else
                    res.send('<div>WOL packet sent.</div>\n<ul>\n<li>IP: ' + device.ip + '</li>\n<li>MAC: ' + device.mac + '</li>\n</ul>');
            }
        });
    });

    _express.get(_endpoints.DEVICES, (req, res) => {
        res.send(_devices);
    });

    _express.set('json spaces', 4);
    _express.listen(LISTEN_PORT);
})();