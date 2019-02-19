# stockmanage
Gestion des stocks


## 使用 Cordova 编译 stock

### 准备工作
1. 安装 Android SDK
2. JDK
3. Node.js
4. Cordova

### 创建应用 StockApp 并编译

<code>
  cd D:\work\cs\c++\vs2015\cordova\stockmanage
  cordova create StockApp
  cd StockApp
  cordova platform add android
  cordova build
</code>

编译成功后得到的 app-debug.apk 文件位于
D:\work\cs\c++\vs2015\cordova\stockmanage\platforms\android\app\build\outputs\apk\debug




## References:

https://walkerkai.wang/Androidcordova.html

http://songker.com/index.php/post/151.html
