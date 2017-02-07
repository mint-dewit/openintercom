var key_order = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
var ptt_ignore = [];
var ptt_pushed = [];

var controls = new Vue({
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
      newuser: false
    },
    channels: []
  },
  methods: {
    pushToTalk: function (key, direction) {
      var channel = key_order.indexOf(key);
      var ignore = ptt_ignore.indexOf(channel);
      var pushed = ptt_pushed.indexOf(channel);

      if (admin !== undefined) if (admin.sub_interface === true) return;
      
      // if channel is talking already, ignore down and incoming up
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
      
      // if down was pushed before, if up then disable, if down then enable
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
    toggleMute: function() {
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
    toggleChannel: function (channel) {
      if (channel.talking) {
        sessions[channel._id].unmute();
      } else {
        sessions[channel._id].mute();
      }
    }
  }
})