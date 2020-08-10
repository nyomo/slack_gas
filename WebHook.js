/**
 * unisan関数
 * @param {string} msg - チャンネルに投稿するメッセージ
 * @param {string} channel - 投稿するチャンネル(省略可)
 * @param {string} icon - このbotのアイコン(省略可)
 * @param {string} name - このbotの名前(省略可)
**/
function unisan(msg=" ",channel="",icon="",name=""){
  var options = { 'text' : msg };
  if(channel != ""){
    options['channel'] = channel;
  }
  if(icon != ""){
    options['icon_emoji'] = icon;
  }
  if(name != ""){
    options['username'] = name;
  }    
  Logger.log(post2slack(options));
}
/**
 * post2slack 関数
 * @param {object} options - WebHookに送るJSON
**/
function post2slack(options){
  const WebhookURL = PropertiesService.getScriptProperties().getProperty('WebhookURL');
  var post_options = null;
  if(options != null){
    post_options = { 'method' : 'post',
                         'contentType': 'application/json; charset=utf-8',
                         'payload' : JSON.stringify(options)
                       };
  }
  if(WebhookURL == null){
    throw new Error("Webhook URLが正しく設定されていません");
  }
  return UrlFetchApp.fetch(WebhookURL,post_options);
}
