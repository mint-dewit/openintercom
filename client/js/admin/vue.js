var admin = new Vue({
  debug: true,
  el: '#admin',
  data: {
    sel_channel: 0,
    new_channel: '',
    sub_interface: false,
    channels: [],
    self: {
      _id: '',
      name: '',
      client: '',
      ip: '',
      admin: true
    },
    users: [],
    temps: [],
    new_users: []
  },
  methods: {
    kickUser: function (_id) {
      for (var i in this.users) {
        if (this.users[i]._id === _id) {
          this.users.splice(i, 1);
        }
      }
      users.remove(_id);
      for (var channel of this.channels) {
        for (var user in channel.users) {
          if (user === _id) {
            channel.users.splice(_id, 1);
            channels.update(channel._id, channel);
          }
        }
      }
    },
    kickTemp: function (_id) {
      for (var i in this.temps) {
        if (this.temps[i]._id === _id) {
          this.temps.splice(i, 1);
        }
      }
      temps.remove(_id);
      for (var channel of this.channels) {
        for (var user in channel.users) {
          if (user === _id) {
            channel.users[_id] = undefined;
            channels.update(channel._id, channel);
          }
        }
      }
    },
    addUser: function (user) {
      console.log(user)
      user.newuser = false;
      temps.update(user._id, user);
    },
    removeChannel: function (_id) {
      channels.remove(_id)
      if (this.channels[this.sel_channel]._id === _id) this.sel_channel = 0
      /*for (var i in this.channels) {
        if (this.channels[i]._id === _id) {
          this.channels.splice(i, 1);
        }
      }*/
    },
    changeChannel: function (index) {
      if (index > this.channels.length-1) this.sel_channel = this.channels.length-1;
      else this.sel_channel = index;
    },
    displayUser: function (_id) {
      if (this.channels.length === 0) return false;
      for (var member in this.channels[this.sel_channel].users) {
        if (member === _id) return true;
      }
      return false;
    },
    removeMember: function (_id) {
      var users = this.channels[this.sel_channel].users;
      users[_id] = undefined;
      this.updateChannel();
    },
    registerChannel: function () {
      channels.create({name: this.new_channel, users: {}})
      /*this.channels.push({
        _id: 'id'+(this.channels.length-1),
        name: this.new_channel,
        users: {}
      });*/

      this.new_channel = '';
      this.sub_interface = false;
    },
    dropped: function (event) {
      var _id = event.dataTransfer.getData('text/plain');
      var users = this.channels[this.sel_channel].users ;
      var speaking = !(event.ctrlKey);
      if (users[_id] === undefined) {
        Vue.set(users, _id, speaking);
        this.updateChannel();
      }
    },
    dragging: function (user, event) {
      event.dataTransfer.setData('text/plain', user._id);
    },
    updateChannel: function () {
      channels.update(this.channels[this.sel_channel]._id, this.channels[this.sel_channel]);
    }
  }
})