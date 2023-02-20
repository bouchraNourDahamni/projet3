new Vue({
    el: '#app',

    data: {
        ws: null, // Our websocket
        newMsg: '', // Holds new messages to be sent to the server
        chatContent: '', // A running list of chat messages displayed on the screen
        email: null, // Email address used for grabbing an avatar
        username: null, // Our username
        joined: false, // True if email and username have been filled in
        connections: [],
        session: null,
    },
    created: async function () {
        var self = this;
        const res = await fetch('http://' + window.location.host + '/info/chat');
        const body = await res.json();
        const id = body[0].id;
        this.ws = new WebSocket('ws://' + window.location.host + '/chat/join' + id);
        this.ws.addEventListener('message', function (e) {
            var msg = JSON.parse(e.data);
            self.chatContent += '<div class="chip">' +
                '<img src="' + self.gravatarURL(msg.email) + '">' // Avatar
                +
                msg.username +
                '</div>' +
                emojione.toImage(msg.message) + '<br/>'; // Parse emojis

            var element = document.getElementById('chat-messages');
            element.scrollTop = element.scrollHeight; // Auto scroll to the bottom

        });
        this.session = new WebSocket('ws://' + window.location.host + '/session/test@gmail.com');
        self.updateMonitor();
    },
    methods: {
        send: function () {
            if (this.newMsg != '') {
                this.ws.send(
                    JSON.stringify({
                        email: this.email,
                        username: this.username,
                        message: $('<p>').html(this.newMsg).text() // Strip out html

                    }));
                this.newMsg = ''; // Reset newMsg

            }

        },
        updateMonitor: async function () {
            const path = 'http://' + window.location.host + '/info/sessions';
            const response = await fetch(path);
            const { connections } = await response.json();
            this.connections = connections;
        },
        join: function () {
            if (!this.email) {
                Materialize.toast('You must enter an email', 2000);
                return

            }
            if (!this.username) {
                Materialize.toast('You must choose a username', 2000);
                return

            }
            this.email = $('<p>').html(this.email).text();
            this.username = $('<p>').html(this.username).text();
            this.joined = true;

        },
        gravatarURL: function (email) {
            return 'http://www.gravatar.com/avatar/' + CryptoJS.MD5(email);

        }
    }
});
