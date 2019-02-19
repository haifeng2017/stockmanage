<?php

if( $_REQUEST["stockid"]) {

   $url = "http://hq.sinajs.cn/list=sh".$_REQUEST['stockid'];

$homepage = file_get_contents_utf8($url);

$findme   = '"';
$pos = strpos($homepage, $findme);

$homepage=substr($homepage,$pos,mb_strlen($homepage)-2);

$price = explode(",", $homepage);

echo $price[3];

}


function file_get_contents_utf8($fn) { 
     $content = file_get_contents($fn); 
      return mb_convert_encoding($content, 'UTF-8', 
          mb_detect_encoding($content, 'GB2312')); 
} 

?>