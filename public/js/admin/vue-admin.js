admin = new Vue({
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
    new_users: [],
    codes: []
  },

  methods: {
    /**
     * when an admin deletes an admin, remove the admin from local list, server and concerned channels.
     */
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

    /**
     * same as kickUser, but instead of admins, this deletes non-admins
     */
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

    /**
     * admin is registering a new user.
     */
    addUser: function (user) {
      if (user.admin) {
        tokens.create({temp: user._id}).then((data) => {
          this.codes.push({name: user.name, value: data.key});
          $('#display_codes').modal('open');
          user.newuser = false;
          temps.update(user._id, user);
        });
      }
      else {
        user.newuser = false;
        temps.update(user._id, user);
      }
    },

    /**
     * admin has seen and (hopefully) saved activation codes.
     */
    clearCodes: function () {
      this.codes = [];
    },

    /**
     * admin has removed a channel
     */
    removeChannel: function (_id) {
      channels.remove(_id);
      if (this.channels[this.sel_channel]._id === _id) this.sel_channel = 0;
    },

    /**
     * change userlist in admin interface.
     */
    changeChannel: function (index) {
      if (index > this.channels.length - 1) this.sel_channel = this.channels.length - 1;
      else this.sel_channel = index;
    },

    /**
     * return boolean whether user should be displayed in channel list.
     */
    displayUser: function (_id) {
      if (this.channels.length === 0) return false;
      for (var member in this.channels[this.sel_channel].users) {
        if (member === _id) return true;
      }
      return false;
    },

    /**
     * remove user from channel list 
     */
    removeMember: function (_id) {
      var users = this.channels[this.sel_channel].users;
      users[_id] = undefined;
      this.updateChannel();
    },

    /**
     * register channel on server.
     */
    registerChannel: function () {
      channels.create({ name: this.new_channel, users: {} })

      this.new_channel = '';
      this.sub_interface = false;
    },

    /**
     * drag and drop events and logic.
     */
    dropped: function (event) {
      var _id = event.dataTransfer.getData('text/plain');
      var users = this.channels[this.sel_channel].users;
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

$('input[type=text]').on('click', () => { admin.sub_interface = true });
$('input[type=text]').on('focusout', () => { admin.sub_interface = false });