var sessions = {};
var ua;

var key_order = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
var ptt_ignore = [];
var ptt_pushed = [];

var admin;

controls = new Vue({
  el: '#control',

  data: {
    registerFailed: false,
    muted: false,
    self: {
      _id: '',
      name: '',
      client: '',
      ip: '',
      admin: false,
      newuser: false,
      auth: {code:'',password:''}
    },
    channels: []
  },

  methods: {
    /* 
      This function contains the logic that enables push to talk functionality. 
      Specifically it checks if the user has the rights to talk.
    */
    pushToTalk: function (key, direction) {
      var channel = key_order.indexOf(key);
      var ignore = ptt_ignore.indexOf(channel);
      var pushed = ptt_pushed.indexOf(channel);

      // check if user is in admin interface, and if the user is inputting text.
      if (admin !== undefined) if (admin.sub_interface === true) return;

      /**
       * if the channel does not exist: return; 
       * if the user pressed a key of a channel that was talking, and is now releasing the key => key is being ignored, stop ignoring the key and return;
       * if the channel cannot be found, or the user has muted it's mic: return
       * if the user does not have rights to talk: return
       * if the key was pressed down, the user is already talking in the channel, and we have not pushed the key before: start ignoring the key and return
       */
      if (channel === -1 || ignore !== -1) {
        delete ptt_ignore[ignore]
        return
      }
      if (!this.channels[channel] || this.muted) return;
      if (this.channels[channel].muted) return;
      if (direction === 'down' && this.channels[channel].talking && pushed === -1) {
        ptt_ignore.push(channel)
        return;
      }

      /**
       * return if the key down event is activated repeatedly
       * mute the channel if the key is released
       * unmute the channel if the key is pressed
       */
      if (direction === 'down' && pushed !== -1) return;
      else if (pushed !== -1) {
        delete ptt_pushed[pushed];
        this.channels[channel].talking = false;
        sessions[this.channels[channel]._id].mute();
      } else if (direction === 'down') {
        this.channels[channel].talking = true;
        sessions[this.channels[channel]._id].unmute();
        ptt_pushed.push(channel)
      }
    },

    /**
     * this function allows the user to mute it's mic.
     */
    toggleMute: function () {
      if (this.muted) {
        for (var channel of this.channels) {
          if (channel.talking) sessions[channel._id].unmute();
        }
        this.muted = false;
      } else {
        for (var session in sessions) {
          sessions[session].mute();
        }
        this.muted = true;
      }
    },

    /**
     * this function allows click-to-toggle channels
     */
    toggleChannel: function (channel) {
      if (channel.talking) {
        sessions[channel._id].unmute();
      } else {
        sessions[channel._id].mute();
      }
    },

    /**
     * this function registers an account that was upgraded to admin.
     * only used for client.
     */
    activateAccount: function () {
      $.post('/activateadmin', {_id: this.self._id, key: this.auth.code, password: this.auth.password}, () => {
        document.location.replace('/login.html');
      })
        .fail(() => console.log('failed. should implement error handler'));
    }
  }
})

$(document).on('keydown', (event) => { controls.pushToTalk(event.key, 'down') });
$(document).on('keyup', (event) => { controls.pushToTalk(event.key, 'up') });