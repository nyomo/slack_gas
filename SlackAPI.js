class SlackAPI {
  constructor(token){
    this.token = token;
    this.channels = {};
  }
  auth_test(){
    return this.post("auth.test","");
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
  channels_list(options = {exclude_archived:true,exclude_members:true}){
    /*
    チャンネルの一覧を取得する
    アーカイブ済みのチャンネルとチャンネルのメンバーはデフォルトで取得しないようにしている
    */
    var list = JSON.parse(this.post("channels.list",options));
    var result = Array();
    if(list["ok"] == true && this.channels_list.length == 0){
      this.channels = result.concat(this.channels,list.channels)
      while(Object.keys(list).indexOf('response_metadata') !== -1 && Object.keys(list.response_metadata).indexOf('next_cursor') !== -1 && list.response_metadata.next_cursor.length > 1){
        options['cursor'] = list["response_metadata"]["next_cursor"];
        list = JSON.parse(this.post("channels.list",options));
        this.channels = result.concat(this.channels,list.channels)
      }
      return this.channels;
    }else{
      return -1;
    }
  }
  channel_name2id(channel_name){
    if(this.channels.length == 0){
      this.channels_list();
    }
    var result =  this.channels.find((channel) => {
      return (channel.name === channel_name);
    });
    if(result != null){
      return result.id;
    }else{
      return null;
    }
  }
  debug(options){
  }
}
