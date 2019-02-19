//  Declare SQL Query for SQLite
// Note that DO NOT USE "transaction" as the name of table
 
var createStocks = "CREATE TABLE IF NOT EXISTS stocks(id INTEGER PRIMARY KEY AUTOINCREMENT, stockid INT,  name TEXT,  shares INT default 0,  price REAL default 0,  cost REAL default 0,  profit REAL default 0,  date TEXT)";
 
var createDealRecord = "CREATE TABLE IF NOT EXISTS dealrecord(id INTEGER PRIMARY KEY AUTOINCREMENT, stockid INT, buyorsell INT, price REAL, shares INT)";

// include current stockid, 手续费费率等等.
// 一个更好的办法是使用 sessionStorage
//var createSetting = "CREATE TABLE IF NOT EXISTS setting(keyname TEXT, value TEXT)";
 
var selectAllStocks = "SELECT * FROM stocks";

var selectstockids = "SELECT stockid FROM stocks";
 
var insertStocks = "INSERT INTO stocks (stockid, name) VALUES (?, ?)";
 
var updateStocks = "UPDATE stocks SET stockid=?, name = ? WHERE id=?";
 
var deleteStocks = "DELETE FROM stocks WHERE id=?";

var queryNameById = "SELECT name FROM stocks WHERE stockid=?";
 
var dropStocks = "DROP TABLE stocks";

var selectAllDealRecord = "SELECT * FROM dealrecord";

var selectTByStockid = "SELECT * FROM dealrecord WHERE stockid=?";
var selectBuyRecord = "SELECT * FROM dealrecord WHERE stockid=? AND buyorsell=-1 ORDER BY price";
 
var insertDealRecord = "INSERT INTO dealrecord (stockid, buyorsell, price, shares) VALUES (?, ?, ?, ?)";
 
var updateDealRecord = "UPDATE dealrecord SET stockid=?, buyorsell = ?, price = ?, shares = ? WHERE id=?";
 
var deleteDealRecord = "DELETE FROM dealrecord WHERE id=?";
var deleteDealRecordByStockid = "DELETE FROM dealrecord WHERE stockid=?";
var dropDealRecord = "DROP TABLE dealrecord";
 
var db = openDatabase("MyStocks", "1.0", "My Stocks", 200000);  // Open SQLite Database
 
var dataset;
 
var DataType;

var stockpriceArray=[];


function initDatabase()  // Function Call When Page is ready.
{
    try {
        if (!window.openDatabase)  // Check browser is supported SQLite or not.
        {
            alert('Databases are not supported in this browser.');
        }
        else {
            createTable();  // If supported then call Function for create table in SQLite
			
			
			initSetKeyValue();
			
			
        }
    }
    catch (e) {
        if (e == 2) {
            // Version number mismatch. 
            console.log("Invalid database version.");
        } else {
            console.log("Unknown error " + e + ".");
        }
        return;
    }
}
 
function createTable()  // Function for Create Table in SQLite.
{
    db.transaction(function (tx) { tx.executeSql(createStocks, [], fn_showSRecords, onError); });

	db.transaction(function (tx) { tx.executeSql(createDealRecord, []); });	
	
}

//设置一些默认参数
function initSetKeyValue()
{
	var q=localStorage.getItem('currentStockid');
	if(!q){
		localStorage.setItem('currentStockid','000000');
	}
	q=localStorage.getItem('traderate');
	if(!q){
		localStorage.setItem('traderate',3);
	}
	q=localStorage.getItem('initcash');
	if(!q){
		localStorage.setItem('initcash',100000);
	}
	q=localStorage.getItem('currentcash');
	if(!q){
		localStorage.setItem('currentcash',100000);
	}
	q=localStorage.getItem('profit');
	if(!q){
		localStorage.setItem('profit',0);
	}
	q=localStorage.getItem('stockvalue');
	if(!q){
		localStorage.setItem('stockvalue',0);
	}
	q=localStorage.getItem('totalshares');
	if(!q){
		localStorage.setItem('totalshares',0);
	}
	q=localStorage.getItem('percentage');
	if(!q){
		localStorage.setItem('percentage',0);
	}
}

function SetKeyValue(keyname,keyvalue)
{
	localStorage.setItem(keyname,keyvalue);
}

function getKeyValue(keyname)
{
	return localStorage.getItem(keyname);
}


//--------------------
//添加新的股票
function fn_insertSRecord() // Get value from Input and insert record . Function Call when Save/Submit Button Click..
{
        var stockidtemp_val = $('input:text[id=stockid]').val();
        var nametemp_val = $('input:text[id=name]').val();
		var stockidtemp;
		var nametemp;

		if (stockidtemp_val !== null || stockidtemp_val !== undefined || stockidtemp_val !== '') {
			stockidtemp=stockidtemp_val;
		}else{
			stockidtemp=0;
		}
		
		if (nametemp_val !== null || nametemp_val !== undefined || nametemp_val !== '') {
			nametemp=nametemp_val;
		}else{
			nametemp=0;
		}
		
	if(stockidtemp==0 || nametemp==0 )
	{
		alert("股票的代码和名称不能为空.");
		//back to the page
		window.location.href='index.html#page_selfchoice';
	}else
	{
        db.transaction(function (tx) { tx.executeSql(insertStocks, [stockidtemp, nametemp], fn_loadAndResetS, onError); });
		
		//db.transaction(function (tx) { tx.executeSql(insertStocks, [stockidtemp, nametemp], onError); });
		
        //tx.executeSql(SQL Query Statement,[ Parameters ] , Sucess Result Handler Function, Error Result Handler Function );
	}
 
}

//--------------------
//添加新的交易记录
// Get value from Input and insert record . Function Call when Save/Submit Button Click..
//当插入交易记录后, 应该更新 Stocks 表中的总持股数.
function fn_insertTRecord() 
{
		//var e = document.getElementById("buyorsell");
		//var buyorselltemp = e.options[e.selectedIndex].value;
		var x = document.getElementById("buyorsell").selectedIndex;
		var y = document.getElementById("buyorsell").options;

        var stockidtemp = $('input:text[id=stockTid]').val();
        var buyorselltemp = y[x].value;	
		
		var pricetemp_val = $('input:text[id=price]').val();
		var pricetemp;
		if (pricetemp_val !== null || pricetemp_val !== undefined || pricetemp_val !== '') {
			pricetemp=pricetemp_val;
		}else{
			pricetemp=0;
		}

        var sharestemp_val = $('input:text[id=shares]').val();
		var sharestemp;
		if (sharestemp_val !== null || sharestemp_val !== undefined || sharestemp_val !== '') {
			sharestemp=sharestemp_val;
		}else{
			sharestemp=0;
		}

	if(pricetemp==0 || sharestemp==0 )
	{
		alert("股票的价格和数量不能为空或者 0.");
		//back to the page
		window.location.href='index.html#page_selfchoice';
	}else{
		var sharetmp=0;
		
		var currentcash=0;
		currentcash=parseFloat(getKeyValue('currentcash'));
		var totalshares=getKeyValue('totalshares');
		
		currentcash += buyorselltemp*pricetemp*sharestemp - fn_cost(buyorselltemp,pricetemp,sharestemp);
		
		currentcash=currentcash.toFixed(2);
		
		totalshares -= buyorselltemp*sharestemp;
		SetKeyValue('currentcash',currentcash);
		SetKeyValue('totalshares',totalshares);
		
		
		//alert(stockidtemp+","+buyorselltemp+","+pricetemp+","+sharestemp);
		//如果 buyorselltemp=1, 即卖, 则先检查 sharestemp 是否大于总的持股数
		//如果是, 则提示错误.
		
        db.transaction(function (tx) { tx.executeSql(insertDealRecord, [stockidtemp, buyorselltemp, pricetemp, sharestemp], fn_loadAndResetT, onError); });
		
		//添加交易记录后应该更新总的股票数和成本均价
		//但是成本均价的计算在这里有点麻烦. 因为涉及到查询原来的均价
		//所以计算放在 fn_showTRecords() 中.
		sharetmp=(-1)*buyorselltemp*sharestemp;	
		
		db.transaction(function (tx) { tx.executeSql("UPDATE stocks SET shares=shares+? WHERE stockid=?", [sharetmp,stockidtemp], fn_loadAndResetS, onError); });
		
		

        //tx.executeSql(SQL Query Statement,[ Parameters ] , Sucess Result Handler Function, Error Result Handler Function );
	}

}

//--------------------
//删除某支股票
function fn_deleteSRecord(id,stockid) // Get id of record . Function Call when Delete Button Click..
{
	//注意删除 Stocks 表中的数据, 原则上要求对于的 dealrecord 表中没有相关记录才能删除. 因此简单的做法是在删之前, 将 dealrecord 中的相关记录删除.
	
	//应该提示确认删除
		
    var iddelete = id.toString();
	
	// 不过这里会导致一个问题, 就是总的持股数就不正确了. 明天再修改.
	db.transaction(function (tx) { tx.executeSql(deleteDealRecordByStockid, [stockid],fn_loadAndResetT, onError); 
                                  //onError; 
                                 });
	
	fn_updateSharesAfterDelStock(stockid);
	
    //db.transaction(function (tx) { tx.executeSql(deleteStocks, [id], fn_showSRecords, onError); alert("删除成功"); });
	db.transaction(function (tx) { 
		tx.executeSql(deleteStocks, [id],fn_loadAndResetS, onError); 
		//alert("删除成功"); 
		});
	
}

//--------------------
//删除某条交易记录
// Get id of record . Function Call when Delete Button Click..
function fn_deleteTRecord(id,buyorsell,stockid,shares) 
{
    var iddelete = id.toString();
    db.transaction(function (tx) { 
		tx.executeSql(deleteDealRecord, [id], fn_showTRecords, onError); 
		//alert("删除成功"); 
		});
	
	//删除后必须得更新 stocks 表中的 shares
	db.transaction(function (tx) { tx.executeSql("UPDATE stocks SET shares=shares+? WHERE stockid=?", [buyorsell*shares,stockid], fn_showSRecords, onError); });
	
	//还得更新 localStorage 中的 totalshares
	var totalshares=0;
	totalshares=getKeyValue('totalshares');
	totalshares= +totalshares + buyorsell*shares;
	SetKeyValue('totalshares',totalshares);
}

//--------------------
//更新股票记录 
function fn_updateSRecord() // Get id of record . Function Call when Delete Button Click..
{
 
    var stockidupdate = $('input:text[id=stockid]').val().toString();
 
    var nameupdate = $('input:text[id=name]').val().toString();
 
    var idupdate = $("#id").val();
 
    db.transaction(function (tx) { tx.executeSql(updateStocks, [stockidupdate, nameupdate, Number(idupdate)], fn_loadAndResetS, onError); });
 
}

//--------------------
//更新股票交易记录 
function fn_updateTRecord() 
{
    var stockidupdate = $('input:text[id=stockid]').val().toString();
	var buyorsellupdate = $('input[name="buyorsell"]:checked').val();
    var priceupdate = $('input:text[id=price]').val().toString();
    var sharesupdate = $('input:text[id=shares]').val().toString();
	
    var idupdate = $("#Tid").val();
 
    db.transaction(function (tx) { tx.executeSql(updateDealRecord, [stockidupdate, buyorsellupdate, priceupdate, sharesupdate, Number(idupdate)], fn_loadAndResetT, onError); });
}
 
// use it carefully
function fn_dropTableStocks() // Function Call when Drop Button Click.. Talbe will be dropped from database.
{
    db.transaction(function (tx) { tx.executeSql(dropStocks, [], fn_showSRecords, onError); });    
}
// use it carefully
function fn_dropTableDealRecord() // Function Call when Drop Button Click.. Talbe will be dropped from database.
{
    db.transaction(function (tx) { tx.executeSql(dropDealRecord, [], fn_showSRecords, onError); });
}

 
function fn_loadSRecord(i) // Function for display records which are retrived from database.
{
    var item = dataset.item(i);
    $("#stockid").val((item.stockid).toString());//item['stockid']
    $("#name").val((item.name).toString());
    $("#id").val((item.id).toString());
}

function fn_loadTRecord(i) // Function for display records which are retrived from database.
{
	var radiobtn;
    var item = dataset.item(i);
	$("#stockTid").val((item.stockid).toString());//item['stockid']
    
	if(item.buyorsell==1){
		radiobtn = document.getElementById("sell");
		radiobtn.checked = true;
	}else{
		radiobtn = document.getElementById("buy");
		radiobtn.checked = true;
	}

    $("#price").val((item.price).toString());//item['price']
	$("#shares").val((item.shares).toString());
    $("#id").val((item.id).toString());
}

//如果使用下面的函数进行表单数据的重置，页面会初始化到最初的状态. 所以不使用.
//可以直接使用 this.form.reset() 函数. 
function fn_resetSForm() // Function for reset form input values.
{
    $("#stockid").val("");
    $("#name").val("");
    $("#id").val("");
}


function fn_resetTForm() // Function for reset form input values.
{
    $("#stockid").val("");
    $("#buyorsell").val("");
    $("#price").val("");
	$("#shares").val("");
}
 
function fn_loadAndResetS() //Function for Load and Reset...
{
	//fn_resetSForm();
    fn_showSRecords();
	//back to the page
	window.location.href='index.html#page_selfchoice';
}

function fn_loadAndResetT(stockTid) //Function for Load and Reset...
{
    //fn_resetTForm();
    fn_showTRecords(stockTid);
	//back to the page
	//window.location.href='index.html#portfolio-info';
}
 
function onError(tx, error) // Function for Hendeling Error...
{
    alert(error.message);
	alert('Error msg occured by function onError.');
}

// Function For Retrive data from Database Display records as list
function fn_showSRecords() 
{
	
 
    $("#portfolio-items-list").html('');//先清空列表
	var idtmp='';
	var nametmp='';
 
    db.transaction(function (tx) {
 
        tx.executeSql(selectAllStocks, [], function (tx, result) {
 
            dataset = result.rows;
			var linkeditdelete='';
			$("#portfolio-items-list").append(linkeditdelete);
 
            for (var i = 0, item = null; i < dataset.length; i++) {
 
                item = dataset.item(i);
				idtmp=item.stockid;//item['stockid'];
				nametmp=item.name;//item['name'];
											
				linkeditdelete = '<li data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-icon="false" data-iconpos="right" data-theme="c" class="portfolio-item ui-btn ui-btn-icon-right ui-li ui-li-has-alt ui-li-has-thumb ui-first-child ui-btn-up-c ui-corner-none"><div class="ui-btn-inner ui-li ui-li-has-alt"><div class="ui-btn-text">';
				
				// onclick 不起作用，怎么办
				//linkeditdelete +='<a href="#portfolio-info" class="ui-link-inherit ui-corner-none" onclick="fn_showTRecords('+idtmp+','+nametmp+');return false;">';
				
				//linkeditdelete +='<a href="#portfolio-info" class="ui-link-inherit ui-corner-none" onclick="return fn_showTRecords('+idtmp+','+nametmp+');">';
				
				linkeditdelete +='<a href="#portfolio-info" class="ui-link-inherit ui-corner-none" onclick="return fn_showTRecords('+idtmp+');">';
				
				linkeditdelete +='<img src="images/portfolio/1/thumb/1_1.jpg" class="ui-li-thumb ui-corner-none"><h3 class="ui-li-heading">'+item.name+'</h3><p class="ui-li-desc">'+item.stockid+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;('+item.shares+' 股)</p></a></div></div>';
				
				
                linkeditdelete +='<a href="#portfolio-info" title="Delete" class="ui-li-link-alt ui-btn ui-btn-icon-notext ui-btn-up-c" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-icon="false" data-iconpos="notext" data-theme="c" onclick="fn_deleteSRecord(' + item.id + ','+item.stockid+');"><span class="ui-btn-inner"><span class="ui-btn-text"></span><span data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-icon="delete" data-iconpos="notext" data-theme="b" title="" class="ui-btn ui-btn-up-d ui-shadow ui-btn-corner-all ui-btn-icon-notext"><span class="ui-btn-inner"><span class="ui-btn-text"></span><span class="ui-icon ui-icon-delete ui-icon-shadow">&nbsp;</span></span></span></span></a></li>';
							
                $("#portfolio-items-list").append(linkeditdelete);
			}
        });
 
    });
 
}


/*
*此函数还存在一些问题, 因为要 return 一些值不太容易.
*这里顺带显示一些信息, 故函数名应该改为 displayInfoByStockid() 比较合适
*http://stackoverflow.com/questions/7816509/web-sql-select-transaction-return-value
*/
function fn_getNameByStockid(stockid,totalshares,average,callBack)
{
	var stockname, displaystr;
	db.transaction(function (tx) {
        tx.executeSql('SELECT name FROM stocks WHERE stockid=?', [stockid], 
		function (tx, results, stockname) {
			var len = results.rows.length, i;
			for (i = 0; i < len; i++){
				stockname=results.rows.item(i).name;
			}
			displaystr=stockname+' ('+stockid+')';
			$("#stockName").html(displaystr);
			displaystr="<p>成本: "+average+" 元</p>";
			displaystr+="<p>持有: "+totalshares+" 股</p>";
			
			$("#stockInfo").html(displaystr);
			//msg = stockname+"<p>Found rows: " + len + "</p>";
			//document.querySelector('#stockName').innerHTML = msg;
			callBack(stockname);
		}, onError); //null); 

    });	
	//return stockname;
}

/* it is a hard problem, we use a php script to obtain the data from hq.sinajs.cn
<script type="text/javascript" src="http://hq.sinajs.cn/list=sh601006" charset="utf-8"> 

</script> 

<script type="text/javascript"> 

var elements=hq_str_sh601006.split(","); 

document.write("current price:"+elements[3]); 

</script> 

*/
/*

var jqxhr = $.get( "example.php", function() {
  alert( "success" );
})
  .done(function() {
    alert( "second success" );
  })
  .fail(function() {
    alert( "error" );
  })
  .always(function() {
    alert( "finished" );
  });
 
 
*/

/* use whateverorigin.org */
//获取新浪数据, 要区分沪市还是深市
// 以sh 开头的是 000001, 6*****
function fn_displayStockPrice(stockid,average,totalshares)
{
    
    stockid=stockid.toString();
	var ch=stockid.substr(0, 1);
	var x="sh";

	if(ch=="6"){
		x="sh";
	}else{
var ch3=stockid.substr(0,3);
switch (ch3)
{
case "001":
  x="sh";
  break;
case "110":
  x="sh";
  break;
case "120":
  x="sh";
  break;
case "129":
  x="sh";
  break;
case "100":
  x="sh";
  break;
case "201":
  x="sh";
  break;
case "310":
  x="sh";
  break;
case "500":
  x="sh";
  break;
case "550":
  x="sh";
  break;
case "700":
  x="sh";
  break;
case "710":
  x="sh";
  break;
case "701":
  x="sh";
  break;
case "711":
  x="sh";
  break;
case "720":
  x="sh";
  break;
case "730":
  x="sh";
  break;
case "735":
  x="sh";
  break;
case "737":
  x="sh";
  break;
case "900":
  x="sh";
  break;

  //-----------sz----------
default:
  x="sz";
}

	}

	var url;
	url="http://hq.sinajs.cn/list="+x+stockid;

    
	//形如 http://hq.sinajs.cn/list=sh601006

	var profit;

	$.getJSON('http://whateverorigin.org/get?url=' + encodeURIComponent(url) + '&callback=?', function(data){
		var elements=data.contents.split(","); 
		//alert("current price: "+elements[3]);
		$("#stockCurrentPrice").html(elements[3]);
		//alert(data.contents);
		
		profit=roundDigit2((elements[3]-average)*totalshares);  
		var msg="<p>市价: "+elements[3]+"</p><p>利润: "+profit+" 元</p>";
		$('#stockCurrentPrice').html(msg);
					 
	});

}

function fn_displayStockPrice2(sid,average,totalshares)
{
	var cp;
	$.get( 
           "getstockprice.php",
                  { stockid: sid},
                  function(data) {
                      cp=parseFloat(data);
                      cp=roundDigit2((cp-average)*totalshares);
					var msg="<p>市价: "+data+"</p><p>利润: "+cp+" 元</p>";
                     $('#stockCurrentPrice').html(msg);
					 
                  },
                "script"
               ).done(function() {
				//do same thing ...
				});	
}

function fn_getNameBySId(stockid)
{
	var stockname, displaystr;
	db.transaction(function (tx) {
        tx.executeSql('SELECT name FROM stocks WHERE stockid=?', [stockid], 
		function (tx, results, stockname) {
			var len = results.rows.length, i;
			for (i = 0; i < len; i++){
				stockname=results.rows.item(i).name;
			}
			displaystr=stockname+' ('+stockid+')';
			$("#stockNameInAnalysis").html(displaystr);
			//msg = stockname+"<p>Found rows: " + len + "</p>";
			//document.querySelector('#stockName').innerHTML = msg;
			//callBack(stockname);
		}, onError); //null); 

    });	
	//return stockname;
}

//获取 stocks 表中对应股票的shares, 然后从 totalshares 中减去.
function fn_updateSharesAfterDelStock(stockid)
{
	var stockshare=0, totalshares=0;
	db.transaction(function (tx) {
        tx.executeSql('SELECT shares FROM stocks WHERE stockid=?', [stockid], 
		function (tx, results) {
			var len = results.rows.length, i;
			for (i = 0; i < len; i++){
				stockshare=results.rows.item(i).shares;
			}
			
		totalshares=getKeyValue('totalshares');
		totalshares-=stockshare;
		SetKeyValue('totalshares',totalshares);
			
		}, onError); //null); 

    });	
	//return shares;
}



// Function For Retrive data from Database Display records as list
function fn_showTRecords(stockid) 
{
	// set the currentStockid
	//setKeyValue('currentStockid', stockid);
	localStorage.setItem('currentStockid', stockid);
	var rate=localStorage.getItem('traderate');
	
	$("#buttonStrategy").html('<a class="next-btn" data-theme="d" data-corners="false" data-role="button" href="#strategy" name="btnStrategy" id="btnStrategy" onclick="fn_showStrategy('+stockid+');return true;" ><img src="images/icons/round/64x64/dzone.png" alt="rss" style="display: block; margin: 0 auto">成本分析</a>');
	
	
	//$("#buttonStrategy").html('<a href="#strategy" class="ui-link-inherit" onclick="fn_showStrategy('+stockid+');return true;">买入成本分析</a>');				
	
    $("#stock-info").html('');
	
	
	//显示添加交易记录的页面.
	var imgname, strname;
	var	totalshares=0, sum=0, average=0, tmp=0;
	var YHS=0, SXF=0, QTZF=0; //YHS: 印花税, SXF: 手续费, QTZF: 其他杂费.
	//这里面要搞清楚交易佣金的计算. 
	//买入时, 印花税为0; 卖出时, 印花税 0.001.
	//手续费=交易费用*0.0003, 这里默认是万三.
	//其他杂费=交易费用*0.00002. 

    db.transaction(function (tx) {
 
        tx.executeSql(selectTByStockid, [stockid], function (tx, result) {
 
            dataset = result.rows;
			var linkeditdelete='';
			$("#stock-info").append(linkeditdelete);
 
            for (var i = 0, item = null; i < dataset.length; i++) {
 
                item = dataset.item(i);
				
				if(item.buyorsell==1){
					imgname='sell';
					strname='卖出';
					totalshares -= item.shares;
					tmp = item.price*item.shares;
					YHS = tmp/1000;
					SXF=roundDigit2(Math.max(tmp*rate/10000, 5));
					QTZF=roundDigit2(tmp*0.00002);
					//SXF=(Math.max(tmp*rate/10000, 5)).toFixed(2);
					//QTZF=(tmp*0.00002).toFixed(2);
					sum = sum-tmp+YHS+SXF+QTZF;
				}else{
					imgname='buy';
					strname='买入';
					totalshares += item.shares;
					tmp = item.price*item.shares;
					SXF=roundDigit2(Math.max(tmp*rate/10000, 5));
					QTZF=roundDigit2(tmp*0.00002);
					//SXF=(Math.max(tmp*rate/10000, 5)).toFixed(2);
					//QTZF=(tmp*0.00002).toFixed(2);
					sum = sum+tmp+SXF+QTZF;
				}
				imgname+='.png';
											
				linkeditdelete = '<li data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-icon="false" data-iconpos="right" data-theme="c" class="portfolio-item ui-btn ui-btn-icon-right ui-li ui-li-has-alt ui-li-has-thumb ui-first-child ui-btn-up-c ui-corner-none"><div class="ui-btn-inner ui-li ui-li-has-alt">';
				
                linkeditdelete += '<div class="ui-btn-text"><a href="#portfolio1" class="ui-link-inherit ui-corner-none"><img src="images/icons/other/'+imgname+'" class="ui-li-thumb ui-corner-none"><h3 class="ui-li-heading">'+item.price+'</h3><p class="ui-li-desc">'+strname+' '+item.shares+' 股</p></a></div></div><a href="#" title="Delete" class="ui-li-link-alt ui-btn ui-btn-icon-notext ui-btn-up-c" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-icon="false" data-iconpos="notext" data-theme="c" onclick="fn_deleteTRecord(' + item.id + ','+item.buyorsell+','+item.stockid+','+item.shares+');"><span class="ui-btn-inner"><span class="ui-btn-text"></span><span data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-icon="delete" data-iconpos="notext" data-theme="b" title="" class="ui-btn ui-btn-up-d ui-shadow ui-btn-corner-all ui-btn-icon-notext"><span class="ui-btn-inner"><span class="ui-btn-text"></span><span class="ui-icon ui-icon-delete ui-icon-shadow">&nbsp;</span></span></span></span></a></li>';
			
                $("#stock-info").append(linkeditdelete);
			}
			
			
			//在页面上显示总持股数和均价
			if(totalshares===0){
				average=0;
			}else{
				average=roundDigit2(sum/totalshares);
				//average=(sum/totalshares).toFixed(2);
			}
			
			
			fn_getNameByStockid(stockid, totalshares, average);
			
			var profit, currentprice;
			
			
			
			//get the price from sina
			fn_displayStockPrice(stockid,average,totalshares);
			
            
			//alert(currentprice);
			
			

			/*
			profit=(currentprice-average)*totalshares;
			var msg="<p>利润: "+currentprice+" 元</p>";
			$("#stockProfit").html(msg);
			*/


        },onError);
 
    });
	
	
	//db.transaction(function (tx) { tx.executeSql("UPDATE stocks SET cost=? WHERE stockid=?", [average,stockid], fn_loadAndResetT, onError); });
	
	return true;
}



function fn_showTAllRecords() // Function For Retrive data from Database Display records as list
{

    $("#dealrecord_allresults").html("");
	
	//显示所有交易记录.	

    db.transaction(function (tx) {
 
        tx.executeSql(selectAllDealRecord, [], function (tx, result) {
 
            dataset = result.rows;
			//var linkeditdelete = '<table class="rwd-table"><tr><th>Name</th><th>Email</th><th>Edit</th><th>Delete</th></tr>';
			var linkeditdelete='<table class="rwd-table">';
			$("#dealrecord_results").append(linkeditdelete);
 
            for (var i = 0, item = null; i < dataset.length; i++) {
 
                item = dataset.item(i);
 
                linkeditdelete = '<tr class="rwd-table"><td>' + item.stockid + '</td><td>' + item.buyorsell + '</td><td>' + item.price + '</td><td>'+ item.shares + '</td><td>' + '<a class="btn_edit" href="#" onclick="fn_loadTRecord(' + i + ');"></a>' + '</td><td>' +
                                            '<a class="btn_delete" href="#" onclick="fn_deleteTRecord(' + item.id + ');"></a></td></tr>';
			
                $("#dealrecord_allresults").append(linkeditdelete);
			}
            linkeditdelete='</table>';
			$("#dealrecord_allresults").append(linkeditdelete);
        },onError);
 
    });
 
}


/* Function: fn_showStrategy()
在策略页面显示某只股票的分批均价信息
首先从 dealrecord 表中检索出关于 stockid 的所有买入信息. 计算 average.
这部分数据不需要使用 JSON 来处理.
 price, shares, average
 //将卖的成本也计算在内.
*/
function fn_showStrategy(stockid) 
{
	// set the currentStockid
	//setKeyValue('currentStockid', stockid);
	localStorage.setItem('currentStockid', stockid);
	var rate=localStorage.getItem('traderate');
	
	
    $("#strategy-info").html('');
	
	
	//显示添加交易记录的页面.
	//var imgname, strname;
	//var	totalshares=0, sum=0, average=0, tmp=0;
	//var YHS=0, SXF=0, QTZF=0; //YHS: 印花税, SXF: 手续费, QTZF: 其他杂费.
	//这里面要搞清楚交易佣金的计算. 
	//买入时, 印花税为0; 卖出时, 印花税 0.001.
	//手续费=交易费用*0.0003, 这里默认是万三.
	//其他杂费=交易费用*0.00002. 

    db.transaction(function (tx) {
 
        tx.executeSql(selectBuyRecord, [stockid], function (tx, result) {
 
            dataset = result.rows;
			
			var avgprice=[];
			var avgshare=[];
			var sum=0;
			var sharesum=0;
			var linkeditdelete='';
            var i=0;
			
			for (i = 0, item=null; i < dataset.length; i++) 
			{
				item = dataset.item(i);
					sum+=item.price*item.shares;
					sum+=fn_cost(-1,item.price,item.shares);
					sharesum+=item.shares;
					
				avgprice[i]=roundDigit2(sum/sharesum);
				sum+=fn_cost(1,avgprice[i],sharesum);//将卖的成本也计算在内.
				avgprice[i]=roundDigit2(sum/sharesum);
				avgshare[i]=sharesum;
			}
			
			
			$("#strategy-info").append(linkeditdelete);
			
 
            for (i = dataset.length-1, item=null; i>=0; i--) 
			{
				item = dataset.item(i);

				linkeditdelete = '<li data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-icon="false" data-iconpos="right" data-theme="c" class="portfolio-item ui-btn ui-btn-icon-right ui-li ui-li-has-alt ui-li-has-thumb ui-first-child ui-btn-up-c ui-corner-none">';
				
                linkeditdelete += '<div class="ui-btn-inner ui-li ui-li-has-alt"><div class="ui-btn-text"><a href="#portfolio1" class="ui-link-inherit ui-corner-none"><img src="images/icons/other/buy.png" class="ui-li-thumb ui-corner-none"><h3 class="ui-li-heading">'+item.price+'</h3><p class="ui-li-desc">买入 '+item.shares+' 股</p></a></div></div>';
				
				linkeditdelete += '<a href="#" title="average" class="ui-li-link-alt-half ui-btn ui-btn-icon-notext ui-btn-up-c" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-icon="false" data-iconpos="notext" data-theme="c"><span class="ui-btn-inner"><span class="ui-btn-text"></span><span data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-icon="info" data-iconpos="notext" data-theme="b" title="" class="ui-btn ui-btn-up-d ui-shadow ui-btn-corner-all ui-btn-icon-notext"><span class="ui-btn-inner"><span class="ui-btn-text"></span><span class="ui-icon-info ui-btn-icon-left ui-icon-shadow">&nbsp;</span></span></span></span><br/><h3 class="ui-li-heading">'+avgprice[i]+'</h3><p class="ui-li-desc"> '+avgshare[i]+' 股</p></a>';

			
                $("#strategy-info").append(linkeditdelete);
			}
			

			
			//在页面上显示总持股数和均价
			if(totalshares===0){
				average=0;
			}else{
				average=(sum/totalshares).toFixed(2);
			}
			
			fn_getNameBySId(stockid);

        },onError);
 
    });
	
	
	//db.transaction(function (tx) { tx.executeSql("UPDATE stocks SET cost=? WHERE stockid=?", [average,stockid], fn_loadAndResetT, onError); });
	
	return true;
}



//更改一些参数, 这里还涉及到初始资金的修改问题。
//其中 initcash 和 traderate 仅当总的股票数为零时才能设置。否则只能充值。
function fn_updateSetting()
{
	var totalshares=getKeyValue('totalshares');
	totalshares=parseInt(totalshares,10);
	if(totalshares===0){
		var initcash_val = $('input:text[id=initcash]').val();
		var traderate_val = $('input:text[id=traderate]').val();
		//check these two input values

		var initcash;
		var traderate;

		if (initcash_val !== null || initcash_val !== undefined || initcash_val !== '') 
		{
			if(isDigit(initcash_val))
			{
				initcash=initcash_val;
			}else{
				alert("必须输入数字!");
			}
		}else{
			initcash=0;
		}

		
		if (traderate_val !== null || traderate_val !== undefined || traderate_val !== '') 
		{
			if(isDigit(traderate_val))
			{
				traderate=traderate_val;
			}else{
				alert("必须输入数字!");
			}
		}else{
			traderate=0;
		}
		
        if(initcash===0 || typeof initcash==='undefined' || traderate===0 || typeof traderate==='undefined')
        {
		alert("初始资金和佣金费率不能为空或 0.");
		//back to the page
		window.location.href='index.html#mysetting';
        }else{

		SetKeyValue('initcash',initcash);
		SetKeyValue('currentcash',initcash);
		SetKeyValue('traderate',traderate);
        }
	}else if(totalshares>0){
		alert("只能当股票总数为0时才能修改。");
	}else{
		alert("Error: 股票总数: "+totalshares+" < 0.");
	}
}


//打开新的页面，显示选定股票的信息
function fn_showStockInfo(stockid)
{
	
	
}

function setStockID(stockid)
{
	$("#stockTid").val(stockid);
}

// see line 239
//$('#portfolio-info').click(function(){ alert('hi, this is a test'); return false; });


 
$(document).ready(function () // Call function when page is ready for load..
{
 
    $("body").fadeIn(2000); // Fede In Effect when Page Load..
 
    initDatabase();
 
    $("#submitSButton").click(fn_insertSRecord);  // Register Event Listener when button click.
    $("#btnSUpdate").click(fn_updateSRecord);
    //$("#btnSReset").click(fn_resetSForm);
    //$("#btnSDrop").click(fn_dropTableStocks);
 
 
	$("#submitTButton").click(fn_insertTRecord);  // Register Event Listener when button click.
    $("#btnTUpdate").click(fn_updateTRecord);
    $("#btnTReset").click(fn_resetTForm);
    //$("#btnTDrop").click(fn_dropTDealRecord);
	
	$("#btnAllTRecords").click(fn_showTAllRecords);
	
	$("#submitSettingButton").click(fn_updateSetting);
	
	//Here can display some info about the stocks 
	//fn_displayStockPrice("600029");
	
 
});
 

function addnewrecord(){
	$("#stockTid").val(getKeyValue('currentStockid'));
	//查询 currentStockid 当前的持股数目
	//$("#totalshares").val($("#hiddentotalshares").val().toString);
}

//显示资金利润等信息
function displaymycash(){
	var initcash=getKeyValue('initcash');
	$("#initcash_on_page_cash").html(initcash);
	var currentcash=getKeyValue('currentcash');
	$("#currentcash_on_page_cash").html(currentcash);
	
	//profit 的计算: profit=currentcash+股票总市值-initcash.
	//不过股票总市值的计算需要联网获得股票的当前价格.
	
	var totalshares=getKeyValue('totalshares');
	$("#totalshares_on_page_cash").html(totalshares);
}
//显示一些参数
function displaymysetting(){
	var initcash=getKeyValue('initcash');
	var traderate=getKeyValue('traderate');
			
	msg="<p>你的初始现金是: "+initcash+" 元; 佣金费率是: 万"+traderate+" (即 "+ traderate/10000+")</p>";
	$("#myrate").html(msg);
	$("#initcash").val(initcash);
	
	$("#traderate").val(traderate);
}
 
function refreshpage() {
	window.location = 'index.html#home';
    // return true or false, depending on whether you want to allow the `href` property to follow through or not
	
	return true;
}


/*计算买卖股票时的成本
*YHS: 印花税, SXF: 手续费, QTZF: 其他杂费.
*这里面要搞清楚交易佣金的计算. 
*买入时, 印花税为0; 卖出时, 印花税 0.001.
*手续费=交易费用*0.0003, 这里默认是万三.
*其他杂费=交易费用*0.00002. 
*/
//计算单次买或卖时产生的额外成本
function fn_cost(buyorsell,price,shares){
	var YHS=0, SXF=0, QTZF=0; 
	var cost=0, tmp=0;
	var rate=0;
	rate=localStorage.getItem('traderate');
	
	if(buyorsell==1){
		//imgname='sell';
		//strname='卖出';
		//totalshares -= item['shares'];
		tmp = price*shares;
		YHS = tmp/1000;
		//SXF=(Math.max(tmp*rate/10000, 5)).toFixed(2);
		//QTZF=(tmp*0.00002).toFixed(2);
		SXF=roundDigit2(Math.max(tmp*rate/10000, 5));
		QTZF=roundDigit2(tmp*0.00002);

	}else{
		//imgname='buy';
		//strname='买入';
		//totalshares += item['shares'];
		tmp = price*shares;
		//no YHS
		//SXF=(Math.max(tmp*rate/10000, 5)).toFixed(2);
		//QTZF=(tmp*0.00002).toFixed(2);
		SXF=roundDigit2(Math.max(tmp*rate/10000, 5));
		QTZF=roundDigit2(tmp*0.00002);
	}
	cost = roundDigit2(YHS+SXF+QTZF);	
	return cost;
}

/* use it carefully */
function setalltodefaultvalue()
{
	var q=localStorage.getItem('currentStockid');
	if(q){
		localStorage.setItem('currentStockid','000000');
	}
	q=localStorage.getItem('traderate');
	if(q){
		localStorage.setItem('traderate',3);
	}
	q=localStorage.getItem('initcash');
	if(q){
		localStorage.setItem('initcash',100000);
	}
	q=localStorage.getItem('currentcash');
	if(q){
		localStorage.setItem('currentcash',100000);
	}
	q=localStorage.getItem('profit');
	if(q){
		localStorage.setItem('profit',0);
	}
	q=localStorage.getItem('stockvalue');
	if(q){
		localStorage.setItem('stockvalue',0);
	}
	q=localStorage.getItem('totalshares');
	if(q){
		localStorage.setItem('totalshares',0);
	}
	q=localStorage.getItem('percentage');
	if(q){
		localStorage.setItem('percentage',0);
	}
	
	fn_dropTableDealRecord();
	fn_dropTableStocks();
	initDatabase();
	alert("所有数据已经清空, 恢复到初始状态.");
	window.location = 'index.html#home';
}




function roundDigit2(number){
	return Math.round10(number,-2);	
}  

/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
// Closure
*/
(function() {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
})();  

	

//-------------------
//判断是否是数字
//Ref url: http://weishangxue.blog.163.com/blog/static/215751882011101844222816/
function isDigit(s)
{
var r,re;
re = /\d*/i; //\d表示数字,*表示匹配多个数字
r = s.match(re);
return (r==s)?1:0;
}