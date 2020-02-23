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
  channels_list(options){
    var list = JSON.parse(this.post("channels.list",options));
    var result = Array();
    if(list["ok"] == true){
      this.channels = result.concat(this.channels,list.channels)
      while(Object.keys(list).indexOf('response_metadata') !== -1 && Object.keys(list.response_metadata).indexOf('next_cursor') !== -1 && list.response_metadata.next_cursor.length > 1){
        list = JSON.parse(this.post("channels.list",{cursor:list["response_metadata"]["next_cursor"]}));
        this.channels = result.concat(this.channels,list.channels)
      }
      return this.channels;
    }else{
      return -1;
    }
  }
  debug(options){
    var list = JSON.parse(this.post("channels.list",options));
    var result = Array();
    if(list["ok"] == true){
      this.channels = result.concat(this.channels,list.channels)
      Logger.log("DEBUG0:" + this.channels.length);
      while(Object.keys(list).indexOf('response_metadata') !== -1 && Object.keys(list.response_metadata).indexOf('next_cursor') !== -1 && list.response_metadata.next_cursor.length > 1){
        Logger.log("DEBUG1:" + Object.keys(list).indexOf('response_metadata'));
        list = JSON.parse(this.post("channels.list",{cursor:list["response_metadata"]["next_cursor"]}));
        this.channels = result.concat(this.channels,list.channels)
      }
      return this.channels;
    }else{
      return -1;
    }
  }
}
