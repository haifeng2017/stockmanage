# stockmanage
Gestion des stocks (Stock management)


## 使用 Cordova 编译 stockmanage

### 准备编译所需的工具
1. Android SDK
2. JDK
3. Node.js
4. Cordova

具体参见 References.

### 创建应用 StockApp 并编译

cd D:\work\cs\c++\vs2015\cordova\stockmanage<br/>

cordova create StockApp  <br/>
  
cd StockApp  <br/>
  
cordova platform add android  <br/>
  
cordova build  <br/>


编译成功后得到的 app-debug.apk 文件位于
  
D:\work\cs\c++\vs2015\cordova\stockmanage\platforms\android\app\build\outputs\apk\debug




## References:

https://walkerkai.wang/Androidcordova.html

http://songker.com/index.php/post/151.html
