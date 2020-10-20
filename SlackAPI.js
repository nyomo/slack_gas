class SlackAPI {
  constructor(token){
    this.token = token;
    this.channels = {};
    this.members = Array();
    //this.members = this.users_list();
    this.email2id_list = Array();
    //this.email2id_list = this.convert_users_list();
  }
  auth_test(){
    return this.post("auth.test","");
  }
  postJSON(endpoint,options = null){
    if(options != null){

      var post_options = { 'method' : 'post',
                           'contentType': 'application/json; charset=utf-8',
                           'headers' : { 
                               'Authorization': "Bearer " + this.token
                            },
                            'payload' : JSON.stringify(options)
                          };
      return UrlFetchApp.fetch("https://slack.com/api/" + endpoint,post_options);
    }
  }
  post(endpoint,options = null){
    var optstr = "";
    if(options != null){
      for(var key in options){
        if(options.hasOwnProperty(key)) {
          var val = options[key];
          optstr = optstr + "&" + key + "=" + val;
        }
      }
    }
    return UrlFetchApp.fetch("https://slack.com/api/" + endpoint + "?token=" + this.token + optstr);
  }
  chat_postMessage(options){
    var result = this.postJSON("chat.postMessage",options);
    return result;
  }
  channels_list(options = {exclude_archived:true,exclude_members:true}){
    /*
    チャンネルの一覧を取得する
    アーカイブ済みのチャンネルとチャンネルのメンバーはデフォルトで取得しないようにしている
    */
    var list = JSON.parse(this.post("channels.list",options));
    var result = Array();
    if(list["ok"] == true && this.channels_list.length == 0){
      this.channels = result.concat(this.channels,list.channels)
      while(Object.keys(list).indexOf('response_metadata') !== -1
            && Object.keys(list.response_metadata).indexOf('next_cursor') !== -1
            && list.response_metadata.next_cursor.length > 1)
      {
        options['cursor'] = list["response_metadata"]["next_cursor"];
        list = JSON.parse(this.post("channels.list",options));
        this.channels = result.concat(this.channels,list["channels"])
      }
      return this.channels;
    }else{
      if(this.channels_list.length != 0){
        return this.channels;
      }else{
        return -1;
      }
    }
  }

  conversations_list(options = {exclude_archived:true}){
    var api1 = "conversations";
    var api2 = "list";    
    /*
    チャンネルの一覧を取得する
    アーカイブ済みのチャンネルはデフォルトで取得しないようにしている
    channels.listと違ってconversations.listにはメンバーのリストは含まれない
    */
    var list = JSON.parse(this.post(api1 + "." + api2,options));
    var result = Array();
    if(list["ok"] == true && this.channels_list.length == 0){
      this.channels = result.concat(this.channels,list.channels)
      while(Object.keys(list).indexOf('response_metadata') !== -1
            && Object.keys(list.response_metadata).indexOf('next_cursor') !== -1
            && list.response_metadata.next_cursor.length > 1)
      {
        options['cursor'] = list["response_metadata"]["next_cursor"];
        list = JSON.parse(this.post("channels.list",options));
        this.channels = result.concat(this.channels,list["channels"])
      }
      
      //プライベートチャンネルを取得する
      options['types'] = 'private_channel';
      list = JSON.parse(this.post(api1 + "." + api2,options));
      if(list["ok"] == true && this.channels_list.length == 0){
        this.channels = result.concat(this.channels,list.channels)
        while(Object.keys(list).indexOf('response_metadata') !== -1
              && Object.keys(list.response_metadata).indexOf('next_cursor') !== -1
              && list.response_metadata.next_cursor.length > 1)
        {
          options['cursor'] = list["response_metadata"]["next_cursor"];
          list = JSON.parse(this.post("channels.list",options));
          this.channels = result.concat(this.channels,list["channels"])
        }
      }else{
        return -1;
      }
      return this.channels;
    }else{
      if(this.channels_list.length != 0){
        return this.channels;
      }else{
        return -1;
      }
    }
  }
  
  conversations_members(channel_id,options = {}){
    /*
    チャンネルなどのメンバー一覧を取得する
    */
    var api1 = "conversations";
    var api2 = "members";
    options['channel'] = channel_id;
    var list = JSON.parse(this.post(api1 + "." + api2,options));
    var result = Array();
    if(list["ok"] == true){
      result = result.concat(list[api2])
      while(Object.keys(list).indexOf('response_metadata') !== -1 && Object.keys(list.response_metadata).indexOf('next_cursor') !== -1 && list.response_metadata.next_cursor.length > 1){
        options['cursor'] = list["response_metadata"]["next_cursor"];
        list = JSON.parse(this.post(api1 + "." + api2,options));
        result = result.concat(list[api2])
      }
      return result;
    }else{
      return -1;
    }
  }
  channel_name2id(channel_name){
    this.channels = this.channels_list();
    for(var i in this.channels){
      if(this.channels[i]['name'] == channel_name){
        return this.channels[i]['id'];
      }
    }
    return -1;
  }
  get_channel_details(channel_name){
    var id = this.channel_name2id(channel_name);
    for(var i in this.channels){
      if(this.channels[i]['name'] == channel_name){
        return this.channels[i];
      }
    }
    return -1;
  }
  users_info(USERID){
    const api1 = "users";
    const api2 = "info";
    const options = { user: USERID };
    var result = JSON.parse(this.post(api1 + "." + api2,options));
    return result;
  }
  users_list(options = {}){
    /*
    現在のワークスペースの全てのメンバーを取得する
    */
    var api1 = "users";
    var api2 = "list";
    var data_name = "members";
    // すでにthis.membersが設定されていたらAPIにアクセスしない
    if(this.members.length > 0){
       return this.members;
    }else{
      var result = this.post(api1 + "." + api2,options);
      var list = JSON.parse(result);
      var ret = Array();
      if(list["ok"] == true){
        ret = ret.concat(list[data_name])
        while(Object.keys(list).indexOf('response_metadata') !== -1 && Object.keys(list.response_metadata).indexOf('next_cursor') !== -1 && list.response_metadata.next_cursor.length > 1){
          options['cursor'] = list["response_metadata"]["next_cursor"];
          list = JSON.parse(this.post(api1 + "."+ api2,options));
          ret = ret.concat(list[data_name]);
        }
        return ret;
      }else{
        return result;
      }
    }
  }
  convert_users_list(){
    var ret = Array();
    if(this.email2id_list.length > 0){
      return this.email2id_list;
    }else{
      for(var i = 0;i < this.members.length;i++){
        var email = this.members[i]['profile']['email'];
        ret[i] = {
                  email:this.members[i]['profile']['email'],
                  id:this.members[i]['id']
                  };
      }
      return ret;
    }
  }
  email2userid(email){
  	//https://slack.com/api/users.lookupByEmail
    const api1 = "users";
    const api2 = "lookupByEmail";
    const options = { email: email };
    var result = this.post(api1 + "." + api2,options);
    var list = JSON.parse(result);
      return list.user.id;
    if(list.ok == "true"){
    }else{
      return null;
    }
  }

  debug(options){
  }
}
