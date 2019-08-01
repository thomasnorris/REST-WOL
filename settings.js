var _outerFunc = module.exports = {
    GetDevices: function() {
        return [
            new Device('Server', '7C:05:07:13:B7:BF', '192.168.0.10'),
            new Device('Leviathan', '70:8B:CD:4E:33:6A', '192.168.0.20')
        ]

        function Device(name, mac, ip) {
            this.name = name;
            this.mac = mac;
            this.ip = ip;
        }
    },

    GetEndpoints: function() {
        return {
            WAKE: '/wake/:name?/:customResponse?',
            DEVICES: '/devices'
        }
    },
}