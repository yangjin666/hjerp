//初始化界面
var defDepotId = null;
var kid = sessionStorage.getItem("userId");
var pageType = getUrlParam('t');  //获取页面类型传值
var depotList = null;
var depotID = null;
var supplierList = null;
var supplierID = null;
var personList = null;
var ProjectSearch=null;
var userBusinessList=null;
var userdepot=null;
var depotHeadMaxId=null; //获取最大的Id
var accepId=null; //保存的主表id
var url;
var depotHeadID = 0;
var preTotalPrice = 0; //前一次加载的金额
var orgDepotHead = "";
var editIndex = undefined;
var listTitle = ""; //单据标题
var listType = ""; //入库 出库
var listSubType = ""; //采购 销售等
var payTypeTitle = "";//付款 收款
var organUrl = ""; //组织数据接口地址
var amountNum = ""; //单据编号开头字符
var depotString = ""; //店铺id列表
var orgDefaultId=''; //单位默认编号
var orgDefaultList; //存储查询出来的会员列表
var accountList; //账户列表
var outItemList; //支出项目列表
var thisTaxRate = 0; //当前税率，选择供应商或者客户的时候设置
var oldNumber = ""; //编辑前的单据编号
var oldId = 0; //编辑前的单据Id
var otherColumns = true; //明细中的‘别名’列是否显示
var otherColumn = true; //明细中的‘别名’列是否显示
var btnEnableList = getBtnStr(); //获取按钮的权限
var mPropertyList = ""; //商品属性列表
var defaultAccountId = 0; //默认账户id
var materialId = 0; //商品ID

var MaterialStock = [];
var gateStock = [];
var mqk = "";
var gqk = "";
var reduceNumber = 0;

var supplier_id = 0;
var gate = "";//发货
var install = "";//安装
var invoice = "";//发票
var payment = "";//付款
var contract = "";//合同
var face = [{"id":"154","depotName":"12daa"}];
var bianliang = -1;

$(function(){
	//初始化系统基础信息
	getType();
	initSystemData_UB();
	initSystemData_depot();
	initSystemData_account();
	initSupplier(); //供应商
	initSalesman(); //销售人员
	initOutItemList(); //初始化支出项目
	initMProperty(); //初始化商品属性
	initTableData();
	ininPager();
	initForm();
	bindEvent();//绑定操作事件
});
//根据单据名称获取类型
function getType(){
	listTitle = $("#tablePanel").prev().text();
	depotString = "|";
	//改变宽度和高度
	$("#searchPanel").panel({width:webW-2});
	$("#tablePanel").panel({width:webW-2});

	var supUrl = "/supplier/findBySelect_sup"; //供应商接口
	// var groupUrl = ;//集团接口
	var companyUrl = "/supplier/findBySelect_cus?UBType=UserCustomer&UBKeyId=" + kid +"supplier_id=" + supplier_id;//公司接口
	var cusUrl = "/supplier/findBySelect_cus?UBType=UserCustomer&UBKeyId=" + kid + "supplier_id=" + supplier_id; //项目接口
	var retailUrl = "/supplier/findBySelect_retail"; //散户接口
	if(listTitle === "采购订单列表"){
		listType = "其它";
		listSubType = "采购订单";
		payTypeTitle = "隐藏";
		organUrl = supUrl;
		amountNum = "CGDD";
	}
	else if(listTitle === "采购入库列表"){
		listType = "入库";
		listSubType = "采购";
		payTypeTitle = "付款";
		organUrl = supUrl;
		amountNum = "CGRK";
	}
	else if(listTitle === "零售退货列表"){
		listType = "入库";
		listSubType = "零售退货"; //注：用预付款购买的产品不能退货
		payTypeTitle = "付款";
		organUrl = retailUrl;
		amountNum = "LSTH";
	}
	else if(listTitle === "销售退货列表"){
		listType = "入库";
		listSubType = "销售退货";
		payTypeTitle = "付款";
		organUrl = cusUrl;
		amountNum = "XSTH";
	}
	else if(listTitle === "其它入库列表"){
		listType = "入库";
		listSubType = "其它";
		payTypeTitle = "隐藏";
		organUrl = supUrl;
		amountNum = "QTRK";
	}
	else if(listTitle === "零售出库列表"){
		listType = "出库";
		listSubType = "零售";
		payTypeTitle = "收款";
		organUrl = retailUrl;
		amountNum = "LSCK";
	}
	else if(listTitle === "销售订单列表"){
		listType = "其它";
		listSubType = "销售订单";
		payTypeTitle = "隐藏";
		organUrl = cusUrl;
		amountNum = "XSDD";
	}
	else if(listTitle === "销售出库列表"){
		listType = "出库";
		listSubType = "销售";
		payTypeTitle = "收款";
		organUrl = cusUrl;
		amountNum = "XSCK";
	}
	else if(listTitle === "采购退货列表"){
		listType = "出库";
		listSubType = "采购退货";
		payTypeTitle = "收款";
		organUrl = supUrl;
		amountNum = "CGTH";
	}
	else if(listTitle === "其它出库列表"){
		listType = "出库";
		listSubType = "其它";
		payTypeTitle = "隐藏";
		organUrl = cusUrl;
		amountNum = "QTCK";
	}
	else if(listTitle === "调拨出库列表"){
		listType = "出库";
		listSubType = "调拨";
		payTypeTitle = "隐藏";
		organUrl = supUrl;
		amountNum = "DBCK";
	}
	else if(listTitle === "组装单列表"){
		listType = "其它";
		listSubType = "组装单";
		payTypeTitle = "隐藏";
		organUrl = supUrl;
		amountNum = "ZZD";
	}
	else if(listTitle === "拆卸单列表"){
		listType = "其它";
		listSubType = "拆卸单";
		payTypeTitle = "隐藏";
		organUrl = supUrl;
		amountNum = "CXD";
	}
}
//初始化系统基础信息
function initSystemData_UB(){
	$.ajax({
		type:"get",
		url: "/userBusiness/getBasicData",
		data: ({
			KeyId:kid,
			Type:"UserDepot"
		}),
		//设置为同步
		async:false,
		dataType: "json",
		success: function (res) {
			if (res && res.code === 200) {
				userBusinessList = res.data.userBusinessList;
				if(userBusinessList !=null) {
					if(userBusinessList.length>0) {
						//用户对应的仓库列表 [1][2][3]...
						userdepot =userBusinessList[0].value;
					}
				}
			}
			else {
				userBusinessList = null;
			}
		}
	});
}
//初始化系统基础信息
function initSystemData_depot(){
	$.ajax({
		type:"get",
		url: "/depot/getAllList",
		//设置为同步
		async:false,
		dataType: "json",
		success: function (res) {
			if(res && res.code === 200){
				depotList = res.data;
				if(depotList !=null) {
					for(var i = 0 ;i < depotList.length;i++) {
						var depot = depotList[i];
						var config = getSystemConfig();
						if(config && config.depotFlag == "1") {
							if(userdepot!=null) {
								if(userdepot.indexOf("["+depot.id+"]")!=-1) {
									if(depot.isDefault){
										defDepotId =  depot.id;
									}
									depotString = depotString + depot.id + ",";
								}
							}
						} else {
							if(depot.isDefault){
								defDepotId =  depot.id;
							}
							depotString = depotString + depot.id + ",";
						}
						if(depot.type === 1){
							depotString = depotString + depot.id + ",";
						}
					}
					depotString = depotString.substring(1, depotString.length-1);
				}
			} else {
				$.messager.alert('提示', '查找系统基础信息异常,请与管理员联系！', 'error');
				return;
			}
		}
	});
}
//初始化供应商、客户、散户信息
function initSupplier(){
	$('#group').combobox({
		url: "/supplier/findSelect?UBType=UserCustomer&UBKeyId=" + kid +"&supplier_id=" + 0,
		valueField:'id',
		textField:'supplier',
		filter: function(q, row){
			var opts = $(this).combobox('options');
			return row[opts.textField].indexOf(q) >-1;
		},
		onLoadSuccess: function(res) {
			var data = $(this).combobox('getData');
			for(var i = 0; i<= data.length; i++){
				if(data && data[i] && data[i].supplier === "非会员"){
					orgDefaultId = data[i].id;
				}
			}
			if(listSubType === "零售"){
				orgDefaultList = res;
			}
		},
		onSelect: function(rec){
			supplier_id = rec.id;
			$('#company').combobox({
				url: "/supplier/findSelect?UBType=UserCustomer&UBKeyId=" + kid +"&supplier_id=" + supplier_id,
				valueField:'id',
				textField:'supplier',
				filter: function(q, row){
					var opts = $(this).combobox('options');
					return row[opts.textField].indexOf(q) >-1;
				},
				onLoadSuccess: function(res) {
					var data = $(this).combobox('getData');
					for(var i = 0; i<= data.length; i++){
						if(data && data[i] && data[i].supplier === "非会员"){
							orgDefaultId = data[i].id;
						}
					}
					if(listSubType === "零售"){
						orgDefaultList = res;
					}
				},
				onSelect: function(rec){
					supplier_id = rec.id;
					$('#OrganId').combobox({
						url: "/supplier/findSelect?UBType=UserCustomer&UBKeyId=" + kid +"&supplier_id=" + supplier_id,
						valueField:'id',
						textField:'supplier',
						filter: function(q, row){
							var opts = $(this).combobox('options');
							return row[opts.textField].indexOf(q) >-1;
						},
						onLoadSuccess: function(res) {
							var data = $(this).combobox('getData');
							for(var i = 0; i<= data.length; i++){
								if(data && data[i] && data[i].supplier === "非会员"){
									orgDefaultId = data[i].id;
								}
							}
							if(listSubType === "零售"){
								orgDefaultList = res;
							}
						},
						onSelect: function(rec){
							if(listSubType === "零售"){
								var option = "";
								if(rec.supplier !== "非会员" && rec.advanceIn >0){
									option = '<option value="预付款">预付款(' + rec.advanceIn + ')</option>';
									option += '<option value="现付">现付</option>';
								}
								else {
									option += '<option value="现付">现付</option>';
								}
								$("#payType").empty().append(option);
							}
							else{
								$.ajax({
									type:"get",
									url: "/supplier/findById",
									data: {
										supplierId: rec.id
									},
									dataType: "json",
									success: function (res){
										if(res && res.code === 200) {
											if(res.data && res.data[0]){
												thisTaxRate = res.data[0].taxRate; //设置当前的税率
											}
										}
									},
									error:function(){

									}
								});
							}
						}
					});
					if(listSubType === "零售"){
						var option = "";
						if(rec.supplier !== "非会员" && rec.advanceIn >0){
							option = '<option value="预付款">预付款(' + rec.advanceIn + ')</option>';
							option += '<option value="现付">现付</option>';
						}
						else {
							option += '<option value="现付">现付</option>';
						}
						$("#payType").empty().append(option);
					}
					else{
						$.ajax({
							type:"get",
							url: "/supplier/findById",
							data: {
								supplierId: rec.id
							},
							dataType: "json",
							success: function (res){
								if(res && res.code === 200) {
									if(res.data && res.data[0]){
										thisTaxRate = res.data[0].taxRate; //设置当前的税率
									}
								}
							},
							error:function(){

							}
						});
					}
				}
			});
			if(listSubType === "零售"){
				var option = "";
				if(rec.supplier !== "非会员" && rec.advanceIn >0){
					option = '<option value="预付款">预付款(' + rec.advanceIn + ')</option>';
					option += '<option value="现付">现付</option>';
				}
				else {
					option += '<option value="现付">现付</option>';
				}
				$("#payType").empty().append(option);
			}
			else{
				$.ajax({
					type:"get",
					url: "/supplier/findById",
					data: {
						supplierId: rec.id
					},
					dataType: "json",
					success: function (res){
						if(res && res.code === 200) {
							if(res.data && res.data[0]){
								thisTaxRate = res.data[0].taxRate; //设置当前的税率
							}
						}
					},
					error:function(){

					}
				});
			}
		}
	});
}
//初始化销售人员
function initSalesman(){
	$('#Salesman').combobox({
		url: "/person/getPersonByNumType?type=1",
		valueField:'id',
		textField:'name',
		multiple: true
	});
	$('#conyract_money').combobox({
		url: "/depot/findDepots",
		valueField: 'id',
		textField: "depotName",
		onSelect:function(rec){
			$("#conyract_money").combobox('setValue', rec.depotName);
		}
	});
}
// //初始化发票类型
// function initConyractMoney() {
//
// }
//初始化收入项目列表
function initOutItemList(){
	$.ajax({
		type:"get",
		url: "/inOutItem/findBySelect?type=out",
		//设置为同步
		async:false,
		dataType: "json",
		success: function (res){
			if(res){
				outItemList = res;
			}
		},
		error:function(){

		}
	});
}
//初始化商品属性
function initMProperty(){
	$.ajax({
		type: "get",
		url: "/materialProperty/list",
		dataType: "json",
		data: ({
			search: JSON.stringify({
				name: ""
			}),
			currentPage: 1,
			pageSize: 100
		}),
		success: function (res) {
			if(res && res.code === 200){
				if(res.data && res.data.page) {
					var thisRows = res.data.page.rows;
					for (var i = 0; i < thisRows.length; i++) {
						if (thisRows[i].enabled) {
							mPropertyList += thisRows[i].nativename + ",";
						}
					}
					if (mPropertyList) {
						mPropertyList = mPropertyList.substring(0, mPropertyList.length - 1);
					}
				}
			}
		},
		//此处添加错误处理
		error:function() {
			$.messager.alert('查询提示','查询信息异常，请稍后再试！','error');
			return;
		}
	});
}
//获取账户信息
function initSystemData_account(){
	$.ajax({
		type:"get",
		url: "/account/getAccount",
		//设置为同步
		async:false,
		dataType: "json",
		success: function (res) {
			if(res && res.code === 200) {
				if(res.data) {
					accountList = res.data.accountList;
					var options = "";
					if(accountList !=null){
						options = "<option value=''>(空)</option>";
						options += "<option value='many' class='many' data-manyAmount=''>多账户</option>";
						for(var i = 0 ;i < accountList.length;i++) {
							var account = accountList[i];
							options += '<option value="' + account.id + '" data-currentAmount="' + account.currentamount + '">' + account.name + '</option>';
							if(account.isdefault) {
								defaultAccountId = account.id; //给账户赋值默认id
							}
						}
						$("#AccountId").empty().append(options);
					}
				}
			}
		}
	});
}
//防止表单提交重复
function initForm(){
	$('#depotHeadFM').form({
		onSubmit: function(){
			return false;
		}
	});
}
//初始化表格数据
function initTableData(){
	if(pageType === "skip") {
		var res = sessionStorage.getItem("rowInfo");
		res = JSON.parse(res);
		editDepotHead(0, res); //自动弹出编辑框，带缓存数据
	}
	var hideType = undefined;
	var isHiddenStatus = true;
	if(payTypeTitle === "隐藏"){
		hideType = true; //隐藏当前列
	}
	var tableToolBar = []

	$.ajax({
		type:"get",
		url: "/userBusiness/getBasicData",
		data: ({
			KeyId:kid,
			Type:"UserDepot"
		}),
		//设置为同步
		async:false,
		dataType: "json",
		success: function (res) {
			if (res && res.code === 200) {
				if (res.data.userBusinessList[0].value == "[10]"){
					tableToolBar.push(
						{
							id:'addDepotHead',
							text:'增加',
							iconCls:'icon-add',
							handler:function() {
								addDepotHead();
								bianliang = -1;
							}
						},
						{
							id:'deleteDepotHead',
							text:'删除',
							iconCls:'icon-remove',
							handler:function() {
								batDeleteDepotHead();
							}
						},
						{
							id: 'okDepotHead',
							text: '反审核',
							iconCls: 'icon-ok',
							handler: function () {
								setStatusFun("0");
							}
						},
						{
							id: 'okDepoGate',
							text: '发货',
							iconCls: 'icon-ok',
							handler: function () {
								setStatusGate("2");
							}
						},
						// {
						// 	id: 'okDepotHead',
						// 	text: '安装',
						// 	iconCls: 'icon-ok',
						// 	handler: function () {
						// 		setStatusFun("4");
						// 	}
						// },
						// {
						// 	id:'installs',
						// 	text:'已安装',
						// 	iconCls:'icon-ok',
						// 	handler:function() {
						// 		setStatusFun("4");
						// 	}
						// },
						{
							id:'export',
							text:'导出详情',
							iconCls:'icon-ok',
							handler:function() {
								exportDepotItem();
							}
						},
						{
							id:'export',
							text:'导出所有合同附件',
							iconCls:'icon-ok',
							handler:function() {
								exportMSG();
							}
						},
						{
							id:'export',
							text:'导出项目对账',
							iconCls:'icon-ok',
							handler:function() {
								exportDepotItemMExcel();
							}
						},
						{
							id:'export',
							text:'导出清华研究院对账',
							iconCls:'icon-ok',
							handler:function() {
								exportDepotItemMSGExcel();
							}
						},
						{
							id:'export',
							text:'导出财务对账',
							iconCls:'icon-ok',
							handler:function() {
								exportDepotItemFinanceExcel();
							}
						}
					)
				} else if (res.data.userBusinessList[0].value == "[18]") {
					tableToolBar.push(
						{
							id:'addDepotHead',
							text:'增加',
							iconCls:'icon-add',
							handler:function() {
								addDepotHead();
								bianliang = -1;
							}
						}
					)
				} else if (res.data.userBusinessList[0].value == "[17]") {
					tableToolBar.push({
							id:'export',
							text:'导出财务对账',
							iconCls:'icon-ok',
							handler:function() {
								exportDepotItemFinanceExcel();
							}
						});
				} else if (res.data.userBusinessList[0].value == "[24]") {
					tableToolBar.push(
						// {
						// 	id: 'okDepotHead',
						// 	text: '安装',
						// 	iconCls: 'icon-ok',
						// 	handler: function () {
						// 		setStatusFun("4");
						// 	}
						// },
						{
                            id: 'okDepoGate',
                            text: '发货',
                            iconCls: 'icon-ok',
                            handler: function () {
								setStatusGate("2");
                            }
                        }
					);
				}
			}
		}
	});
	var isShowLastMoneyColumn = false; //是否显示优惠后金额和价税合计,true为隐藏,false为显示
	if(listSubType == "调拨" || listSubType == "其它" || listSubType == "零售" || listSubType == "零售退货" || listSubType == "采购订单" || listSubType == "销售订单" || listSubType == "组装单" || listSubType == "拆卸单"){
		isShowLastMoneyColumn = true; //隐藏
	}
	var isShowOrganNameColumn = false; //是否显示供应商、客户等信息,true为隐藏,false为显示
	var organNameTitle = ""; //组织名称标题
	if(listSubType == "调拨" || listSubType == "组装单" || listSubType == "拆卸单"){
		isShowOrganNameColumn = true; //隐藏
	}
	else {
		if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "采购退货列表" || listTitle == "其它入库列表"){
			organNameTitle = "供应商名称";
		}
		else if(listTitle == "销售订单列表" || listTitle == "销售退货列表" || listTitle == "销售出库列表" || listTitle == "其它出库列表"){
			organNameTitle = "项目名称";
		}
		else if(listTitle == "零售出库列表" || listTitle == "零售退货列表"){
			organNameTitle = "会员卡号";
		}
	}
	var opWidth = 45; //操作宽度
	var isShowSkip = false; //是否显示跳转按钮
	var opTitle = ""; //跳转按钮的标题
	if(listTitle == "采购订单列表") {
		opWidth = 120;
		isShowSkip = true;
		opTitle = "转采购入库";
	} else if(listTitle == "销售订单列表") {
		opWidth = 120;
		isShowSkip = true;
		opTitle = "转销售出库";
	}
	if (userdepot == "[10]" || userdepot == "[20]" ) {
		$('#tableData').datagrid({
			height:heightInfo,
			rownumbers: false,
			//动画效果
			animate:false,
			//选中单行
			singleSelect : true,
			collapsible:false,
			selectOnCheck:false,
			pagination: true,
			//交替出现背景
			striped : true,
			pageSize: 10,
			pageList: initPageNum,
			columns:[[
				{ field: 'id',width:35,align:"center",checkbox:true},
				{ title: '操作',field: 'op',align:"center",width:opWidth,
					formatter:function(value,rec,index) {
						var str = '';
						var orgId = rec.organid? rec.organid:0;
						str += '<img title="查看" src="/js/easyui-1.3.5/themes/icons/list.png" style="cursor: pointer;" onclick="showDepotHead(\'' + index + '\');"/>&nbsp;&nbsp;&nbsp;';
						str += '<img title="编辑" src="/js/easyui-1.3.5/themes/icons/pencil.png" style="cursor: pointer;" onclick="editDepotHead(\'' + index + '\');"/>&nbsp;&nbsp;&nbsp;';
						str += '<img title="删除" src="/js/easyui-1.3.5/themes/icons/edit_remove.png" style="cursor: pointer;" onclick="deleteDepotHead('+ rec.id +',' + orgId +',' + rec.totalprice+',' + rec.status + ');"/>';
						if(isShowSkip) {
							str += '&nbsp;&nbsp;&nbsp;<img title="导出合同附件" src="/js/easyui-1.3.5/themes/icons/redo.png" style="cursor: pointer;" onclick="exportMSGDAN(\'' + index + '\');"/>';
						}
						return str;
					}
				},
				{ title: '状态',field: 'status', width:70,align:"center",formatter:function(value){
						if(value === "0") {
							return "<span style='color:red;'>意向单</span>";
						} else if(value === "1") {
							return "<span style='color:green;'>正式订单</span>";
						} else if (value === "3"){
							return "<span style='color:blue;'>已出库</span>";
						} else if (value === "4"){
							return "<span style='color:blue;'>售后订单</span>";
						} else if (value === "6") {
							return "<span style='color:blue;'>已收款</span>";
						} else if (value === "7"){
							return "<span style='color:blue;'>已开票</span>";
						} else if (value === "2"){
							return "<span style='color:blue;'>已发货</span>";
						}
					}
				},
				{ title: organNameTitle, field: 'organName',width:120,align:"center", hidden:isShowOrganNameColumn},
				{ title: '单据编号',field: 'number',width:135, formatter:function (value,rec) {
						if(rec.linknumber) {
							return value + "[转]";
						} else {
							return value;
						}
					}
				},
				{ title: '订单类型',field: 'order_type',width:70 },

				{ title: '商品信息',field: 'materialsList',width:240,formatter:function(value){
						if(value) {
							return value.replace(",","，");
						}
					}
				},
				{ title: '数量',field:'operNumber',width:40},
				{ title: '合同',field: 'contract',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '收款',field: 'payment',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '发票',field: 'invoice',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '发货',field: 'gate',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '安装',field: 'install',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '金额合计',field: 'totalprice',width:60},
				{ title: '单据日期',field: 'opertimeStr',width:72},
				{ title: '含税合计',field: 'totaltaxlastmoney',hidden:isShowLastMoneyColumn,width:60,formatter:function(value,rec){
						return (rec.discountmoney + rec.discountlastmoney).toFixed(2);
					}
				},
				{ title: '优惠后金额',field: 'discountlastmoney',hidden:isShowLastMoneyColumn,width:80},
				{ title: payTypeTitle,field: 'changeamount',width:50,hidden:hideType}
			]],
			toolbar:tableToolBar,
			onLoadError:function() {
				$.messager.alert('页面加载提示','页面加载异常，请稍后再试！','error');
				return;
			}
		});
	} else if (userdepot == "[17]"){
		$('#tableData').datagrid({
			height:heightInfo,
			rownumbers: false,
			//动画效果
			animate:false,
			//选中单行
			singleSelect : true,
			collapsible:false,
			selectOnCheck:false,
			pagination: true,
			//交替出现背景
			striped : true,
			pageSize: 10,
			pageList: initPageNum,
			columns:[[
				{ field: 'id',width:35,align:"center",checkbox:true},
				{ title: '操作',field: 'op',align:"center",width:opWidth,
					formatter:function(value,rec,index) {
						var str = '';
						var orgId = rec.organid? rec.organid:0;
						str += '<img title="查看" src="/js/easyui-1.3.5/themes/icons/list.png" style="cursor: pointer;" onclick="showDepotHead(\'' + index + '\');"/>&nbsp;&nbsp;&nbsp;';
						str += '<img title="编辑" src="/js/easyui-1.3.5/themes/icons/pencil.png" style="cursor: pointer;" onclick="editDepotHead(\'' + index + '\');"/>&nbsp;&nbsp;&nbsp;';
						if(isShowSkip) {
							str += '&nbsp;&nbsp;&nbsp;<img title="导出合同附件" src="/js/easyui-1.3.5/themes/icons/redo.png" style="cursor: pointer;" onclick="exportMSGDAN(\'' + index + '\');"/>';
						}
						return str;
					}
				},
				{ title: '状态',field: 'status', width:70,align:"center",formatter:function(value){
						if(value === "0") {
							return "<span style='color:red;'>意向单</span>";
						} else if(value === "1") {
							return "<span style='color:green;'>正式订单</span>";
						} else if (value === "3"){
							return "<span style='color:blue;'>已出库</span>";
						} else if (value === "4"){
							return "<span style='color:blue;'>售后订单</span>";
						} else if (value === "6") {
							return "<span style='color:blue;'>已收款</span>";
						} else if (value === "7"){
							return "<span style='color:blue;'>已开票</span>";
						} else if (value === "2"){
							return "<span style='color:blue;'>已发货</span>";
						}
					}
				},
				{ title: organNameTitle, field: 'organName',width:120, hidden:isShowOrganNameColumn},
				{ title: '单据编号',field: 'number',width:135, formatter:function (value,rec) {
						if(rec.linknumber) {
							return value + "[转]";
						} else {
							return value;
						}
					}
				},
				{ title: '订单类型',field: 'order_type',width:70 },

				{ title: '商品信息',field: 'materialsList',width:240,formatter:function(value){
						if(value) {
							return value.replace(",","，");
						}
					}
				},
				{ title: '数量',field:'operNumber',width:40},
				{ title: '合同',field: 'contract',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				// { title: '合同编号',field: 'conyract_number',width:130},
				// { title: '合同金额',field: 'conyract_money',width:130},
				{ title: '收款',field: 'payment',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '发票',field: 'invoice',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '发货',field: 'gate',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '安装',field: 'install',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '金额合计',field: 'totalprice',width:60},
				{ title: '单据日期',field: 'opertimeStr',width:78},
				{ title: '含税合计',field: 'totaltaxlastmoney',hidden:isShowLastMoneyColumn,width:60,formatter:function(value,rec){
						return (rec.discountmoney + rec.discountlastmoney).toFixed(2);
					}
				},
				{ title: '优惠后金额',field: 'discountlastmoney',hidden:isShowLastMoneyColumn,width:80},
				{ title: payTypeTitle,field: 'changeamount',width:50,hidden:hideType}
			]],
			toolbar:tableToolBar,
			onLoadError:function() {
				$.messager.alert('页面加载提示','页面加载异常，请稍后再试！','error');
				return;
			}
		});
	}else if (userdepot == "[18]"){
		$('#tableData').datagrid({
			height:heightInfo,
			rownumbers: false,
			//动画效果
			animate:false,
			//选中单行
			singleSelect : true,
			collapsible:false,
			selectOnCheck:false,
			pagination: true,
			//交替出现背景
			striped : true,
			pageSize: 10,
			pageList: initPageNum,
			columns:[[
				{ field: 'id',width:35,align:"center",checkbox:true},
				{ title: '操作',field: 'op',align:"center",width:opWidth,
					formatter:function(value,rec,index) {
						var str = '';
						var orgId = rec.organid? rec.organid:0;
						str += '<img title="查看" src="/js/easyui-1.3.5/themes/icons/list.png" style="cursor: pointer;" onclick="showDepotHead(\'' + index + '\');"/>&nbsp;&nbsp;&nbsp;';
						str += '<img title="编辑" src="/js/easyui-1.3.5/themes/icons/pencil.png" style="cursor: pointer;" onclick="editDepotHead(\'' + index + '\');"/>&nbsp;&nbsp;&nbsp;';
						// str += '<img title="删除" src="/js/easyui-1.3.5/themes/icons/edit_remove.png" style="cursor: pointer;" onclick="deleteDepotHead('+ rec.id +',' + orgId +',' + rec.totalprice+',' + rec.status + ');"/>';
						if(isShowSkip) {
							str += '&nbsp;&nbsp;&nbsp;<img title="导出合同附件" src="/js/easyui-1.3.5/themes/icons/redo.png" style="cursor: pointer;" onclick="exportMSGDAN(\'' + index + '\');"/>';
						}
						return str;
					}
				},
				{ title: '状态',field: 'status', width:70,align:"center",formatter:function(value){
						if(value === "0") {
							return "<span style='color:red;'>意向单</span>";
						} else if(value === "1") {
							return "<span style='color:green;'>正式订单</span>";
						} else if (value === "3"){
							return "<span style='color:blue;'>已出库</span>";
						} else if (value === "4"){
							return "<span style='color:blue;'>售后订单</span>";
						} else if (value === "6") {
							return "<span style='color:blue;'>已收款</span>";
						} else if (value === "7"){
							return "<span style='color:blue;'>已开票</span>";
						} else if (value === "2"){
							return "<span style='color:blue;'>已发货</span>";
						}
					}
				},
				{ title: organNameTitle, field: 'organName',width:120, hidden:isShowOrganNameColumn},
				{ title: '单据编号',field: 'number',width:135, formatter:function (value,rec) {
						if(rec.linknumber) {
							return value + "[转]";
						} else {
							return value;
						}
					}
				},
				{ title: '订单类型',field: 'order_type',width:70 },

				{ title: '商品信息',field: 'materialsList',width:240,formatter:function(value){
						if(value) {
							return value.replace(",","，");
						}
					}
				},
				{ title: '数量',field:'operNumber',width:40},
				{ title: '单据日期',field: 'opertimeStr',width:72},
				{ title: '合同',field: 'contract',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				// { title: '合同编号',field: 'conyract_number',width:130},
				// { title: '合同金额',field: 'conyract_money',width:130},
				{ title: '收款',field: 'payment',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '发票',field: 'invoice',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '发货',field: 'gate',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '安装',field: 'install',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '金额合计',field: 'totalprice',width:60},
				{ title: '含税合计',field: 'totaltaxlastmoney',hidden:isShowLastMoneyColumn,width:60,formatter:function(value,rec){
						return (rec.discountmoney + rec.discountlastmoney).toFixed(2);
					}
				},
				{ title: '优惠后金额',field: 'discountlastmoney',hidden:isShowLastMoneyColumn,width:80},
				{ title: payTypeTitle,field: 'changeamount',width:50,hidden:hideType}
			]],
			toolbar:tableToolBar,
			onLoadError:function() {
				$.messager.alert('页面加载提示','页面加载异常，请稍后再试！','error');
				return;
			}
		});
	}else if (userdepot == "[24]"){
		$('#tableData').datagrid({
			height:heightInfo,
			rownumbers: false,
			//动画效果
			animate:false,
			//选中单行
			singleSelect : true,
			collapsible:false,
			selectOnCheck:false,
			pagination: true,
			//交替出现背景
			striped : true,
			pageSize: 10,
			pageList: initPageNum,
			columns:[[
				{ field: 'id',width:35,align:"center",checkbox:true},
				{ title: '操作',field: 'op',align:"center",width:opWidth,
					formatter:function(value,rec,index) {
						var str = '';
						var orgId = rec.organid? rec.organid:0;
						str += '<img title="查看" src="/js/easyui-1.3.5/themes/icons/list.png" style="cursor: pointer;" onclick="showDepotHead(\'' + index + '\');"/>&nbsp;&nbsp;&nbsp;';
						str += '<img title="编辑" src="/js/easyui-1.3.5/themes/icons/pencil.png" style="cursor: pointer;" onclick="editDepotHead(\'' + index + '\');"/>&nbsp;&nbsp;&nbsp;';
						return str;
					}
				},
				{ title: '状态',field: 'status', width:70,align:"center",formatter:function(value){
						if(value === "0") {
							return "<span style='color:red;'>意向单</span>";
						} else if(value === "1") {
							return "<span style='color:green;'>正式订单</span>";
						} else if (value === "3"){
							return "<span style='color:blue;'>已出库</span>";
						} else if (value === "4"){
							return "<span style='color:blue;'>售后订单</span>";
						} else if (value === "6") {
							return "<span style='color:blue;'>已收款</span>";
						} else if (value === "7"){
							return "<span style='color:blue;'>已开票</span>";
						} else if (value === "2"){
							return "<span style='color:blue;'>已发货</span>";
						}
					}
				},
				{ title: organNameTitle, field: 'organName',width:120, hidden:isShowOrganNameColumn},
				{ title: '单据编号',field: 'number',width:135, formatter:function (value,rec) {
						if(rec.linknumber) {
							return value + "[转]";
						} else {
							return value;
						}
					}
				},
				{ title: '订单类型',field: 'order_type',width:70 },

				{ title: '商品信息',field: 'materialsList',width:240,formatter:function(value){
						if(value) {
							return value.replace(",","，");
						}
					}
				},
				{ title: '数量',field:'operNumber',width:40},
				{ title: '单据日期',field: 'opertimeStr',width:72},
				{ title: '合同',field: 'contract',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '收款',field: 'payment',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '发票',field: 'invoice',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '发货',field: 'gate',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				{ title: '安装',field: 'install',width:40,formatter:function(value){
						if (value == "否"){
							return "<span style='color:red;'>否</span>";
						}else{
							return "<span style='color:black;'>是</span>";
						}
					}
				},
				// { title: '是否需要安装',field: 'install',width:130},
				// { title: '是否需要人脸机',field: 'machine',width:130},
				{ title: '人脸机类型',field: 'machine_type',hidden:isShowLastMoneyColumn,width:130},
                { title: '人脸机数量',field: 'machine_number',hidden:isShowLastMoneyColumn,width:130},
				// { title: '闸机是否需要',field: 'gate',width:130},
				{ title: '闸机类型',field: 'gate_type',hidden:isShowLastMoneyColumn,width:130},
				{ title: '闸机数量',field: 'gate_number',hidden:isShowLastMoneyColumn,width:130},
				// { title: '操作员',field: 'operpersonname',width:60},
				{ title: '金额合计',field: 'totalprice',width:60},
				{ title: '含税合计',field: 'totaltaxlastmoney',hidden:isShowLastMoneyColumn,width:60,formatter:function(value,rec){
						return (rec.discountmoney + rec.discountlastmoney).toFixed(2);
					}
				},
				{ title: '优惠后金额',field: 'discountlastmoney',hidden:isShowLastMoneyColumn,width:80},
				{ title: payTypeTitle,field: 'changeamount',width:50,hidden:hideType}
			]],
			toolbar:tableToolBar,
			onLoadError:function() {
				$.messager.alert('页面加载提示','页面加载异常，请稍后再试！','error');
				return;
			}
		});
	}
	dgResize();
}
//查找库存的方法
function findStockNumById(depotId, mId, monthTime, body, input, ratio, type){
	var thisRatio = 1; //比例
	$.ajax({
		url: "/material/findById",
		type: "get",
		dataType: "json",
		data: {
			id: mId
		},
		success: function (rec) {
			if(rec && rec.code === 200 && rec.data && rec.data[0]) {
				var loadRatio = 1; //在单位输入框上面加载比例字段
				if(rec.data[0].unit) { //如果存在计量单位信息
					loadRatio = 1;
				}
				else{
					var unitName = rec.data[0].unitName;
					if(unitName) {
						thisRatio = unitName.substring(unitName.indexOf(":")+1).replace(")","");
						unitName = unitName.substring(0, unitName.indexOf("("));
					}
					var unitArr = unitName.split(",");
					var basicUnit = unitArr[0]; //基础单位
					var otherUnit = unitArr[1]; //副单位
					var unitSetInput =""; //单位
					if(listSubType === "采购订单" || listSubType === "采购" || listSubType === "采购退货"){
						unitSetInput = rec.data[0].firstinunit;
						if(basicUnit==unitSetInput){ //基础单位等于选择的单位
							loadRatio = 1;
						}
						else if(otherUnit==unitSetInput){ //副单位等于选择的单位
							loadRatio = thisRatio;
						}
					}
					else if(listSubType === "销售订单" || listSubType === "销售" || listSubType === "销售退货" || listSubType === "零售" || listSubType === "零售退货"){
						unitSetInput = rec.data[0].firstoutunit;
						if(basicUnit==unitSetInput){ //基础单位等于选择的单位
							loadRatio = 1;
						}
						else if(otherUnit==unitSetInput){ //副单位等于选择的单位
							loadRatio = thisRatio;
						}
					}
				}
				//查询库存
				$.ajax({
					type: "get",
					url: '/depotItem/findStockNumById',
					data:{
						depotId: depotId,
						mId: mId
					},
					dataType: "json",
					success: function (res) {
						if(res && res.code === 200) {
							if (res.data) {
								var thisStock = res.data.stock;
								if (type == "select") { //选择下拉框的时候
									if (ratio != undefined && ratio != 1) {
										loadRatio = ratio;
									}
								}
								else if (type == "click") { //点击库存的时候
									if (ratio != undefined) {
										loadRatio = ratio;
									}
								}
								thisStock = (thisStock / loadRatio).toFixed(0);
								body.find("[field='Stock']").find(input).val(thisStock).attr("data-stock", thisStock);
								// body.find("[field='Stock']").find(input).val(thisStock).attr("data-stock", res.data.page[0].thisSum); //加载库存数据
							}
							else {
								body.find("[field='Stock']").find(input).val(0).attr("data-stock", 0); //加载库存数据
							}
							body.find("[field='Stock']").find(input).prop("readonly", "readonly"); //设置库存数据为只读
						}
					},
					error:function() {
						$.messager.alert('查询提示','查询数据后台异常，请稍后再试！','error');
					}
				});
			}
		},
		error: function () {
			$.messager.alert('查询提示', '查询数据后台异常，请稍后再试！', 'error');
		}
	});
}
//优惠率、合计的统计方法
function statisticsFun(body,UnitPrice,OperNumber,footer,taxRate){
	var TotalPrice = 0;
	var taxLastMoneyTotal = 0;
	// var heji = "合计:";
	//金额的合计
	body.find("[field='AllPrice']").each(function(){
		if($(this).find("div").text()!==""){
			TotalPrice = TotalPrice + parseFloat($(this).find("div").text().toString());
		}

	});
	TotalPrice = TotalPrice + UnitPrice*OperNumber;
	// footer.find("[field='AllPrice']").find("div").text(heji+(TotalPrice).toFixed(2)); //金额的合计
	footer.find("[field='AllPrice']").find("div").text("合计："+(TotalPrice).toFixed(2)); //金额的合计
	//价税合计的总计
	body.find("[field='TaxLastMoney']").each(function(){
		if($(this).find("div").text()!==""){
			taxLastMoneyTotal = taxLastMoneyTotal + (parseFloat($(this).find("div").text().toString())-0);
		}
	});
	taxLastMoneyTotal = taxLastMoneyTotal + (UnitPrice*OperNumber*(1+taxRate/100));
	footer.find("[field='TaxLastMoney']").find("div").text((taxLastMoneyTotal).toFixed(2)); //价税合计的页脚总计
	var discount = $("#Discount").val(); //优惠率
	var discountMoney = (taxLastMoneyTotal*discount/100).toFixed(2);
	$("#DiscountMoney").val(discountMoney);//优惠金额
	var discountLastMoney = (taxLastMoneyTotal*(1-discount/100)).toFixed(2)
	$("#DiscountLastMoney").val(discountLastMoney);//优惠后金额
	if($("#AccountId").val()!=="many"){
		$("#ChangeAmount").val(discountLastMoney); //本次付、收款
	}
	var changeAmountNum = $("#ChangeAmount").val()-0; //本次付款或者收款
	$("#Debt").val((discountLastMoney-changeAmountNum).toFixed(2)); //本次欠款

	if(listSubType == "零售" || listSubType == "零售退货") {
		$("#ChangeAmount, #getAmount").val((TotalPrice).toFixed(2));
		$("#backAmount").val(0);
	}
}
//初始化表格数据-商品列表-编辑状态
function initTableData_material(type,TotalPrice,biaoshi,roleID){
	var body,footer,input; //定义表格和文本框
	var ratio = 1; //比例-品名专用depotHead/updateDepotHeadAndDetail
	var ratioDepot = 1; //比例-仓库用
	var monthTime = getNowFormatMonth();
	var isShowAnotherDepot = true; //显示对方仓库,true为隐藏,false为显示
	var depotHeadName = ""; //仓库名称
	var depotUrl = ""; //仓库接口地址
	var depotTextField = ""; //仓库下拉名称
	var anotherDepotHeadName = ""; //对方仓库的列的标题
	var anotherDepotUrl = ""; //对方仓库接口地址
	var anotherDepotTextField = "";
	if(listSubType == "调拨"){
		isShowAnotherDepot = false; //调拨时候显示对方仓库
		anotherDepotHeadName = "调入仓库";
		anotherDepotUrl = '/depot/findDepotByUserId?UBType=UserDepot&UBKeyId='+kid;
		anotherDepotTextField = "depotName";
	}
	depotHeadName = "仓库名称";
	depotUrl = '/depot/findDepotByUserId?UBType=UserDepot&UBKeyId='+kid;
	depotTextField = "depotName";
	var isShowTaxColumn = false; //是否显示税率相关的列,true为隐藏,false为显示
	if(listSubType == "调拨" || listSubType == "其它" || listSubType == "零售" || listSubType == "零售退货" || listSubType == "采购订单" || listSubType == "销售订单" || listSubType == "组装单" || listSubType == "拆卸单"){
		isShowTaxColumn = true; //隐藏
	}
	var isShowMaterialTypeColumn = true; //是否显示商品类型相关的列,true为隐藏,false为显示
	if(listSubType == "组装单" || listSubType == "拆卸单"){
		isShowMaterialTypeColumn = false; //显示
	}
	if (biaoshi == 1){
		$('#materialData').datagrid({
			height:245,
			rownumbers: false,
			//动画效果
			animate:false,
			//选中单行
			singleSelect : true,
			collapsible:false,
			selectOnCheck:false,
			//单击行是否选中
			checkOnSelect : false,
			pagination: false,
			//交替出现背景
			striped : true,
			showFooter: true,
			//loadFilter: pagerFilter,
			onClickRow: onClickRow,
			columns:[[
				{ field: 'Id',width:35,align:"center",checkbox:true},
				{ title: '商品类型',field: 'MType',editor:'validatebox',hidden:isShowMaterialTypeColumn,width:80},
				{ title: depotHeadName, field: 'DepotId', editor: 'validatebox', width: 90,
					formatter: function (value, row, index) {
						return row.DepotName;
					},
					editor: {
						type: 'combobox',
						options: {
							valueField: 'id',
							textField: depotTextField,
							method: 'get',
							url: depotUrl,
							onSelect:function(rec){
								var depotId = rec.id;
								body =$("#depotHeadFM .datagrid-body");
								footer =$("#depotHeadFM .datagrid-footer");
								input = ".datagrid-editable-input";
								var mId = body.find("[field='MaterialId']").find(".combo-value").val();
								if(mId){
									var type = "select"; //type 类型：点击 click，选择 select
									findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
								}
							}
						}
					}
				},
				{ title: '订单类型',field: 'order_type',editor:'validatebox',width:78,
					formatter: function (value, row, index) {
						return row.DepotName;
					},
					editor: {
						type: 'combobox',
						options: {
							valueField: 'id',
							textField: depotTextField,
							method: 'get',
							url: '/depot/findDepotByUserId?UBType=1&UBKeyId='+kid,
							onSelect:function(rec){
								var depotId = rec.id;
								body =$("#depotHeadFM .datagrid-body");
								footer =$("#depotHeadFM .datagrid-footer");
								input = ".datagrid-editable-input";
								var mId = body.find("[field='MaterialId']").find(".combo-value").val();
								if(mId){
									var type = "select"; //type 类型：点击 click，选择 select
									findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
								}
							}
						}
					}
				},
				{ title: '品名(型号)(扩展信息)(单位)',field: 'MaterialId',width:160,
					formatter:function(value,row,index){
						return row.MaterialName;
					},
					editor:{
						type:'combobox',
						options:{
							valueField:'Id',
							textField:'MaterialName',
							method:'get',
							url: "/material/findBySelect",
							panelWidth: 300, //下拉框的宽度
							//全面模糊匹配，过滤字段
							filter: function(q, row){
								var opts = $(this).combobox('options');
								return row[opts.textField].indexOf(q) >-1;
							},
							onBeforeLoad: function(param){
								param.mpList = mPropertyList; //商品属性
							},
							change:function(){
								var machine_type = [field='OperNumber'];


							},
							onSelect:function(rec){
								debugger
								if(rec) {
									var machineId = 0;
									var gateId = 0;
									var mId = rec.Id;
									if (rec.Id == "623") {
										machineId = 1;
										gateId = 2;
									} else if (rec.Id ==  "624"){
										machineId = 1;
										gateId = 2;
									} else if (rec.Id ==  "625"){
										machineId = 1;
										gateId = 2;
									} else if (rec.Id ==  "626"){
										machineId = 1;
										gateId = 2;
									} else if (rec.Id ==  "627"){
										machineId = 1;
										gateId = 2;
									} else if (rec.Id ==  "631"){
										machineId = 0;
										gateId = 2;
									} else if (rec.Id ==  "632"){
										machineId = 0;
										gateId = 2;
									} else if (rec.Id ==  "633"){
										machineId = 0;
										gateId = 2;
									} else if (rec.Id ==  "634"){
										machineId = 0;
										gateId = 2;
									} else if (rec.Id ==  "635"){
										machineId = 0;
										gateId = 2;
									} else if (rec.Id ==  "630"){
										machineId = 3;
										gateId = 0;
									} else if (rec.Id ==  "629"){
										machineId = 1;
										gateId = 0;
									} else if (rec.Id ==  "628"){
										machineId = 1;
										gateId = 0;
									}
									$.ajax({
										url: "/material/findById",
										type: "get",
										dataType: "json",
										data: {
											id: mId
										},
										success: function (res) {
											if(res && res.code === 200 && res.data && res.data[0]) {
												var retailPrice = res.data[0].retailprice-0; //零售价格
												var presetPriceOne = res.data[0].presetpriceone-0; //预计采购价
												var presetPriceTwo = res.data[0].presetpricetwo-0; //批发价
												var firstInUnit = res.data[0].firstinunit; //首选入库单位
												var firstOutUnit = res.data[0].firstoutunit; //首选出库单位
												var basicPresetPriceOne = ""; //多单位-入库-基础价格
												var basicPresetPriceTwo = ""; //多单位-出库-基础价格
												var retailPriceOne = ""; //多单位-入库-零售价格
												var otherPresetPriceOne = ""; //多单位-入库-其他价格
												var otherPresetPriceTwo = ""; //多单位-出库-其他价格
												var retailPriceTwo = ""; //多单位-出库-零售价格
												var basicUnit = ""; //基础单位
												var otherUnit = ""; //其他单位
												if(!res.data[0].unit){
													var ps = res.data[0].pricestrategy;
													var psObj = JSON.parse(ps);
													basicPresetPriceOne = psObj[0].basic.PresetPriceOne-0;
													basicPresetPriceTwo = psObj[0].basic.PresetPriceTwo-0;
													retailPriceOne = psObj[0].basic.RetailPrice-0;
													otherPresetPriceOne = psObj[1].other.PresetPriceOne-0;
													otherPresetPriceTwo = psObj[1].other.PresetPriceTwo-0;
													retailPriceTwo = psObj[1].other.RetailPrice-0;
													basicUnit = psObj[0].basic.Unit;
													otherUnit = psObj[1].other.Unit
												}
												body =$("#depotHeadFM .datagrid-body");
												footer =$("#depotHeadFM .datagrid-footer");
												input = ".datagrid-editable-input";
												console.log(body.find("[field='machine_type']"))

												// body.find("[field='machine_type']").combobox("reload", "/material/machineType?id="+materialId);

												if(res.data[0].unit){ //如果存在计量单位信息
													ratio = 1; //重置比例为1
													body.find("[field='Unit']").find(input).val(res.data[0].unit); //设置-计量单位信息
													body.find("[field='Unit']").find(input).prop("readonly","readonly"); //设置计量单位为只读
													body.find("[field='Unit']").find(input).off("click"); //移除点击事件
													body.find("[field='Unit']").find(input).attr("data-ratio",ratio); //修改比例缓存信息
												}
												else {
													var unitName = res.data[0].unitName;
													if(unitName) {
														ratio = unitName.substring(unitName.indexOf(":")+1).replace(")",""); //给比例赋值
														unitName = unitName.substring(0, unitName.indexOf("("));
													}
													var unitArr = unitName.split(",");
													var basicUnit = unitArr[0]; //基础单位
													var otherUnit = unitArr[1]; //副单位
													var unitSetInput =""; //单位
													body.find("[field='Unit']").find(input).prop("readonly","readonly"); //设置计量单位为只读
													var loadRatio = 1; //在单位输入框上面加载比例字段
													if(listSubType === "采购" || listSubType === "采购退货" || listSubType === "采购订单"){
														unitSetInput = res.data[0].firstinunit; //给单位文本框赋值
														if(basicUnit==unitSetInput){ //基础单位等于选择的单位
															loadRatio = 1;
														}
														else if(otherUnit==unitSetInput){ //副单位等于选择的单位
															loadRatio = ratio;
														}
													}
													else if(listSubType === "销售" || listSubType === "销售退货" || listSubType === "销售订单" || listSubType === "零售" || listSubType === "零售退货"){
														unitSetInput = res.data[0].firstoutunit; //给单位文本框赋值
														if(basicUnit==unitSetInput){ //基础单位等于选择的单位
															loadRatio = 1;
														}
														else if(otherUnit==unitSetInput){ //副单位等于选择的单位
															loadRatio = ratio;
														}
													}
													body.find("[field='Unit']").find(input).val(unitSetInput).attr("data-ratio", loadRatio); //设置-首选单位

													body.find("[field='Unit']").find(input).off("click").on("click",function(){
														if(basicUnit && otherUnit) {
															var self = this;
															//定义模版
															var temp = "<div class='unit-list'>";
															temp +="<ul>";
															temp +="<li data-type='basic' data-ratio='1'>" + basicUnit + "</li>";
															temp +="<li data-type='other' data-ratio='" + ratio + "'>" + otherUnit + "</li>";
															temp +="</ul>";
															temp +="</div>";
															if($('.unit-list').length){
																$('.unit-list').remove(); //如果存在计量单位列表先移除
															}
															else {
																$(self).after(temp); //加载列表信息
															}
															//计量单位列表的单击事件
															$('.unit-list ul li').off("click").on("click",function(){
																var unit = $(this).text();
																var thisRatio = $(this).attr("data-ratio"); //获取比例
																$(self).val(unit).attr("data-ratio", thisRatio);
																$(self).keyup(); //模拟键盘操作
																$('.unit-list').remove(); //移除计量单位列表
																var stock = body.find("[field='Stock']").find(input).attr("data-stock"); //从缓存中取值
																var type = $(this).attr("data-type");
																var UnitPrice = 0;
																if(type === "basic"){
																	if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "销售退货列表" || listTitle == "其它入库列表") {
																		UnitPrice = basicPresetPriceOne;
																	}
																	else if(listTitle == "销售订单列表" || listTitle == "销售出库列表" || listTitle == "采购退货列表" || listTitle == "其它出库列表" || listTitle == "调拨出库列表") {
																		UnitPrice = basicPresetPriceTwo;
																	}
																	else if(listTitle == "零售出库列表" || listTitle == "零售退货列表"){
																		UnitPrice = retailPriceOne;
																	}
																	body.find("[field='Stock']").find(input).val(stock); //修改库存
																}
																else if(type === "other"){
																	if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "销售退货列表" || listTitle == "其它入库列表") {
																		UnitPrice = otherPresetPriceOne;
																	}
																	else if(listTitle == "销售订单列表" || listTitle == "销售出库列表" || listTitle == "采购退货列表" || listTitle == "其它出库列表" || listTitle == "调拨出库列表") {
																		UnitPrice = otherPresetPriceTwo;
																	}
																	else if(listTitle == "零售出库列表" || listTitle == "零售退货列表"){
																		UnitPrice = retailPriceTwo;
																	}
																	// body.find("[field='Stock']").find(input).val((stock/ratio).toFixed(2)); //修改库存
																	// body.find("[field='Stock']").find(input).val(stock);
																}
																body.find("[field='UnitPrice']").find(input).val(UnitPrice); //单价
																var OperNumber = body.find("[field='OperNumber']").find(input).val(); //获取数量
																var taxRate = body.find("[field='TaxRate']").find(input).val(); //获取税率
																body.find("[field='TaxUnitPrice']").find(input).val((UnitPrice*(1+taxRate/100)).toFixed(2)); //含税单价
																body.find("[field='AllPrice']").find(input).val((UnitPrice*OperNumber).toFixed(2)); //金额
																body.find("[field='TaxMoney']").find(input).val((UnitPrice*OperNumber*(taxRate/100)).toFixed(2)); //税额
																body.find("[field='TaxLastMoney']").find(input).val((UnitPrice*OperNumber*(1+taxRate/100)).toFixed(2)); //价税合计
																statisticsFun(body,UnitPrice,OperNumber,footer,taxRate);
															});
															//点击空白处移除计量单位列表
															$(".datagrid-body").off("click").on("click",function(){
																$('.unit-list').remove(); //移除计量单位列表
															});
														}
													});

												}
												var detailPrice = 0; //明细列表-单价
												if(listSubType == "零售" || listSubType == "零售退货") {
													if(res.data[0].unit) { //如果存在计量单位信息
														detailPrice = retailPrice;
													}
													else {
														if (firstOutUnit == basicUnit) {
															detailPrice = retailPriceOne;
														}
														else if (firstOutUnit == otherUnit) {
															detailPrice = retailPriceTwo;
														}
													}
												}
												else if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "销售退货列表" || listTitle == "其它入库列表") {
													if(res.data[0].unit) { //如果存在计量单位信息
														detailPrice = presetPriceOne;
													}
													else {
														if (firstInUnit == basicUnit) {
															detailPrice = basicPresetPriceOne;
														}
														else if (firstInUnit == otherUnit) {
															detailPrice = otherPresetPriceOne;
														}
													}
												}
												else if(listTitle == "销售订单列表" || listTitle == "销售出库列表" || listTitle == "采购退货列表" || listTitle == "其它出库列表" || listTitle == "调拨出库列表") {
													if(res.data[0].unit) { //如果存在计量单位信息
														detailPrice = presetPriceTwo;
													}
													else {
														if(firstOutUnit==basicUnit) {
															detailPrice = basicPresetPriceTwo;
														}
														else if(firstOutUnit==otherUnit){
															detailPrice = otherPresetPriceTwo;
														}
													}
												}
												body.find("[field='OperNumber']").find(input).val(1); //数量初始化为1
												//单价和总价赋值
												if(!detailPrice) {
													detailPrice = 0;
												}
												body.find("[field='UnitPrice']").find(input).val(detailPrice);
												body.find("[field='AllPrice']").find(input).val(detailPrice);
												var taxRate = body.find("[field='TaxRate']").find(input).val()-0; //获取税率
												body.find("[field='TaxUnitPrice']").find(input).val((detailPrice*(1+taxRate/100)).toFixed(2));  //含税单价
												body.find("[field='TaxMoney']").find(input).val((detailPrice*(taxRate/100)).toFixed(2));  //税额
												body.find("[field='TaxLastMoney']").find(input).val((detailPrice*(1+taxRate/100)).toFixed(2));  //价税合计
												body.find("[field='conyract_money']").find(input).val((detailPrice*(1+taxRate/100)).toFixed(2));  //合同价格
												statisticsFun(body,detailPrice,1,footer,taxRate);
												if (res.data[0].name == "套餐一（人脸识别考勤机2台、三辊闸机1台）") {
													body.find("[field='machine_number']").find(input).val("2");
													body.find("[field='gate_number']").find(input).val("1");
												} else if (res.data[0].name ==  "套餐二（人脸识别考勤机2台、三辊闸机2台）"){
													body.find("[field='machine_number']").find(input).val("2");
													body.find("[field='gate_number']").find(input).val("2");
													machineId = 1;
													gateId = 2;
												} else if (res.data[0].name ==  "套餐三（人脸识别考勤机4台、三辊闸机2台）"){
													body.find("[field='machine_number']").find(input).val("4");
													body.find("[field='gate_number']").find(input).val("2");
												} else if (res.data[0].name ==  "套餐四（人脸识别考勤机3台、三辊闸机3台）"){
													body.find("[field='machine_number']").find(input).val("3");
													body.find("[field='gate_number']").find(input).val("3");
												} else if (res.data[0].name ==  "套餐五（人脸识别考勤机6台、三辊闸机3台）"){
													body.find("[field='machine_number']").find(input).val("6");
													body.find("[field='gate_number']").find(input).val("3");
												} else if (res.data[0].name ==  "产品四（三辊闸1台）"){
													body.find("[field='machine_number']").find(input).val("0");
													body.find("[field='gate_number']").find(input).val("1");
												} else if (res.data[0].name ==  "产品五（翼闸单机芯1台）"){
													body.find("[field='machine_number']").find(input).val("0");
													body.find("[field='gate_number']").find(input).val("1");
												} else if (res.data[0].name ==  "产品六（翼闸双机芯1台）"){
													body.find("[field='machine_number']").find(input).val("0");
													body.find("[field='gate_number']").find(input).val("1");
												} else if (res.data[0].name ==  "产品七（全高闸单通道1台）"){
													body.find("[field='machine_number']").find(input).val("0");
													body.find("[field='gate_number']").find(input).val("1");
												} else if (res.data[0].name ==  "产品八（全高闸双通道1台）"){
													body.find("[field='machine_number']").find(input).val("0");
													body.find("[field='gate_number']").find(input).val("1");
												} else if (res.data[0].name ==  "产品三（人证信息采集设备1台）"){
													body.find("[field='machine_number']").find(input).val("1");
													body.find("[field='gate_number']").find(input).val("0");
												} else if (res.data[0].name ==  "产品二（固定式人脸识别考勤机1台）"){
													body.find("[field='machine_number']").find(input).val("1");
													body.find("[field='gate_number']").find(input).val("0");
												} else if (res.data[0].name ==  "产品一（移动式人脸识别考勤平板1台）"){
													body.find("[field='machine_number']").find(input).val("1");
													body.find("[field='gate_number']").find(input).val("0");
												}
												//查询库存信息
												var depotId = body.find("[field='DepotId']").find(".combo-value").val();
												if(depotId) {
													var type = "select"; //type 类型：点击 click，选择 select
													findStockNumById(depotId, mId, monthTime, body, input, loadRatio, type);
												}
											}
										},
										error: function() {
											$.messager.alert('页面加载提示','页面加载异常，请稍后再试！','error');
										}
									}),
									$.ajax({
										url: "/material/machineType?id="+machineId,
										type: "get",
										dataType: "json",
										success : function(result) {
											var ed = $('#materialData').datagrid('getEditor', {index:bianliang,field:'machine_type'});
											$(ed.target).combobox('loadData', result);
										}
									}),
                                    $.ajax({
                                        url: "/material/machineTypes?id="+gateId,
                                        type: "get",
                                        dataType: "json",
                                        success : function(result) {
											var gt = $('#materialData').datagrid('getEditor', {index:bianliang,field:'gate_type'});
											$(gt.target).combobox('loadData', result);
                                        }
                                    });
								}
							}
						}
					}
				},
				{ title: '库存',field: 'Stock',editor:'validatebox',width:70},
				{ title: anotherDepotHeadName, field: 'AnotherDepotId',editor:'validatebox',hidden:isShowAnotherDepot,width:90,
					formatter: function (value, row, index) {
						return row.AnotherDepotName;
					},
					editor: {
						type: 'combobox',
						options: {
							valueField: 'id',
							textField: anotherDepotTextField,
							method: 'get',
							url: anotherDepotUrl
						}
					}
				},
				{ title: '单位',field: 'Unit',editor:'validatebox',width:60},
				{ title: '数量',field: 'OperNumber',editor:'validatebox',width:60},
				{ title: '单价',field: 'UnitPrice',editor:'validatebox',width:60,readonly:"readonly"},
				{ title: '含税单价',field: 'TaxUnitPrice',editor:'validatebox',hidden:isShowTaxColumn,width:78},
				{ title: '金额',field: 'AllPrice',editor:'validatebox',width:90},
				{ title: '税率(%)',field: 'TaxRate',editor:'validatebox',hidden:isShowTaxColumn,width:78},
				{ title: '税额',field: 'TaxMoney',editor:'validatebox',hidden:isShowTaxColumn,width:78},
				{ title: '价税合计',field: 'TaxLastMoney',editor:'validatebox',hidden:isShowTaxColumn,width:78},
				{ title: '人脸机类型',field: 'machine_type',width:150,
					editor: {
						type: 'combobox',
						options: {
							required: true,
							editable:false,
						 	missingMessage: '请选择',
							url: '/material/machineType?id='+materialId,
							valueField: 'id',
							textField: 'depotName',
							// data: face
							panelHeight: 100,
							onSelect:function(rec){
								debugger
								$.ajax({
									url: "/material/machineIDType?id="+rec.id,
									type: "get",
									dataType: "json",
									success : function(result) {
										var ed1 = $('#materialData').datagrid('getEditor', {index:bianliang,field:'machine_type_model'});
										$(ed1.target).combobox('loadData', result);
									}
								});
							}
						}
					}
				},
				{ title: '人脸机型号',field: 'machine_type_model',width:150,
					editor: {
						type: 'combobox',
						options: {
							required: true,
							editable:false,
							missingMessage: '请选择',
							url: '/material/machineType?id='+materialId,
							valueField: 'id',
							textField: 'depotName',
							// data: face
							panelHeight: 100,
						}
					}
				},
				{ title: '人脸机数量',field: 'machine_number',editor:'validatebox',width:78},
				{ title: '闸机类型',field: 'gate_type',width:150,
                    editor: {
                        type: 'combobox',
                        options: {
                            required: true,
                            editable:false,
                            missingMessage: '请选择',
                            url: '/material/machineType?id='+materialId,
                            valueField: 'id',
                            textField: 'depotName',
                            // data: face
                            panelHeight: 100,
							onSelect:function(rec){
								debugger
								$.ajax({
									url: "/material/gateIDType?id="+rec.id,
									type: "get",
									dataType: "json",
									success : function(result) {
										var ed2 = $('#materialData').datagrid('getEditor', {index:bianliang,field:'gate_type_model'});
										$(ed2.target).combobox('loadData', result);
									}
								});
							}
                        }
                    }
                },
				{ title: '闸机型号',field: 'gate_type_model',width:150,
					editor: {
						type: 'combobox',
						options: {
							required: true,
							editable:false,
							missingMessage: '请选择',
							url: '/material/machineType?id='+materialId,
							valueField: 'id',
							textField: 'depotName',
							// data: face
							panelHeight: 100,
						}
					}
				},
				{ title: '闸机数量',field: 'gate_number',editor:'validatebox',width:78},
				{ title: '品名-别',field: 'OtherField1',editor:'validatebox',hidden:otherColumns,width:60},
				{ title: '型号-别',field: 'OtherField2',editor:'validatebox',hidden:otherColumns,width:60},
				{ title: '颜色-别',field: 'OtherField3',editor:'validatebox',hidden:otherColumns,width:60},
				{ title: '备注1',field: 'OtherField4',editor:'validatebox',hidden:true,width:60},
				{ title: '备注2',field: 'OtherField5',editor:'validatebox',hidden:true,width:60}
			]],
			toolbar:[
				{
					id:'append',
					text:'新增行',
					iconCls:'icon-add',
					handler:function() {
						append(); //新增行
						bianliang++;
					}
				},
				// {
				// 	id:'delete',
				// 	text:'删除行',
				// 	iconCls:'icon-remove',
				// 	handler:function() {
				// 		batchDel(); //删除行
				// 	}
				// },{
				// 	id:'delete',
				// 	text:'删除行',
				// 	iconCls:'icon-remove',
				// 	handler:function() {
				// 		batchDel(); //删除行
				// 	}
				// },
				{
					id:'reject',
					text:'撤销',
					iconCls:'icon-undo',
					handler:function() {
						reject(); //撤销
						bianliang = -1;
					}

				}
			],
			onLoadError:function()
			{
				$.messager.alert('页面加载提示','页面加载异常，请稍后再试！','error');
				return;
			}
		});
	}else if (biaoshi == 2){
		if (roleID == 20){
			$('#materialData').datagrid({
				height:245,
				rownumbers: false,
				//动画效果
				animate:false,
				//选中单行
				singleSelect : true,
				collapsible:false,
				selectOnCheck:false,
				//单击行是否选中
				checkOnSelect : false,
				pagination: false,
				//交替出现背景
				striped : true,
				showFooter: true,
				//loadFilter: pagerFilter,
				onClickRow: onClickRow,
				columns:[[
					{ field: 'Id',width:35,align:"center",checkbox:true},
					{ title: '商品类型',field: 'MType',editor:'validatebox',hidden:isShowMaterialTypeColumn,width:80},
					{ title: depotHeadName, field: 'DepotId', editor: 'validatebox', width: 90,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: depotUrl,
								readonly : true,
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '订单类型',field: 'order_type',editor:'validatebox',width:78,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: '/depot/findDepotByUserId?UBType=1&UBKeyId='+kid,
								readonly : true,
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '品名(型号)(扩展信息)(单位)',field: 'MaterialId',width:160,
						formatter:function(value,row,index){
							return row.MaterialName;
						},
						editor:{
							type:'combobox',
							options:{
								valueField:'Id',
								textField:'MaterialName',
								method:'get',
								url: "/material/findBySelect",
								panelWidth: 300, //下拉框的宽度
								readonly : true,
								//全面模糊匹配，过滤字段
								filter: function(q, row){
									var opts = $(this).combobox('options');
									return row[opts.textField].indexOf(q) >-1;
								},
								onBeforeLoad: function(param){
									param.mpList = mPropertyList; //商品属性
								},
								change:function(){
									var machine_type = [field='OperNumber'];
								},
								onSelect:function(rec){
									if(rec) {
										var mId = rec.Id;
										$.ajax({
											url: "/material/findById",
											type: "get",
											dataType: "json",
											data: {
												id: mId
											},
											success: function (res) {;
												if(res && res.code === 200 && res.data && res.data[0]) {
													var retailPrice = res.data[0].retailprice-0; //零售价格
													var presetPriceOne = res.data[0].presetpriceone-0; //预计采购价
													var presetPriceTwo = res.data[0].presetpricetwo-0; //批发价
													var firstInUnit = res.data[0].firstinunit; //首选入库单位
													var firstOutUnit = res.data[0].firstoutunit; //首选出库单位
													var basicPresetPriceOne = ""; //多单位-入库-基础价格
													var basicPresetPriceTwo = ""; //多单位-出库-基础价格
													var retailPriceOne = ""; //多单位-入库-零售价格
													var otherPresetPriceOne = ""; //多单位-入库-其他价格
													var otherPresetPriceTwo = ""; //多单位-出库-其他价格
													var retailPriceTwo = ""; //多单位-出库-零售价格
													var basicUnit = ""; //基础单位
													var otherUnit = ""; //其他单位
													if(!res.data[0].unit){
														var ps = res.data[0].pricestrategy;
														var psObj = JSON.parse(ps);
														basicPresetPriceOne = psObj[0].basic.PresetPriceOne-0;
														basicPresetPriceTwo = psObj[0].basic.PresetPriceTwo-0;
														retailPriceOne = psObj[0].basic.RetailPrice-0;
														otherPresetPriceOne = psObj[1].other.PresetPriceOne-0;
														otherPresetPriceTwo = psObj[1].other.PresetPriceTwo-0;
														retailPriceTwo = psObj[1].other.RetailPrice-0;
														basicUnit = psObj[0].basic.Unit;
														otherUnit = psObj[1].other.Unit;
													}
													body =$("#depotHeadFM .datagrid-body");
													footer =$("#depotHeadFM .datagrid-footer");
													input = ".datagrid-editable-input";
													if(res.data[0].unit){ //如果存在计量单位信息
														ratio = 1; //重置比例为1
														body.find("[field='Unit']").find(input).val(res.data[0].unit); //设置-计量单位信息
														body.find("[field='Unit']").find(input).prop("readonly","readonly"); //设置计量单位为只读
														body.find("[field='Unit']").find(input).off("click"); //移除点击事件
														body.find("[field='Unit']").find(input).attr("data-ratio",ratio); //修改比例缓存信息
													}
													else {
														var unitName = res.data[0].unitName;
														if(unitName) {
															ratio = unitName.substring(unitName.indexOf(":")+1).replace(")",""); //给比例赋值
															unitName = unitName.substring(0, unitName.indexOf("("));
														}
														var unitArr = unitName.split(",");
														var basicUnit = unitArr[0]; //基础单位
														var otherUnit = unitArr[1]; //副单位
														var unitSetInput =""; //单位
														body.find("[field='Unit']").find(input).prop("readonly","readonly"); //设置计量单位为只读
														var loadRatio = 1; //在单位输入框上面加载比例字段
														if(listSubType === "采购" || listSubType === "采购退货" || listSubType === "采购订单"){
															unitSetInput = res.data[0].firstinunit; //给单位文本框赋值
															if(basicUnit==unitSetInput){ //基础单位等于选择的单位
																loadRatio = 1;
															}
															else if(otherUnit==unitSetInput){ //副单位等于选择的单位
																loadRatio = ratio;
															}
														}
														else if(listSubType === "销售" || listSubType === "销售退货" || listSubType === "销售订单" || listSubType === "零售" || listSubType === "零售退货"){
															unitSetInput = res.data[0].firstoutunit; //给单位文本框赋值
															if(basicUnit==unitSetInput){ //基础单位等于选择的单位
																loadRatio = 1;
															}
															else if(otherUnit==unitSetInput){ //副单位等于选择的单位
																loadRatio = ratio;
															}
														}
														body.find("[field='Unit']").find(input).val(unitSetInput).attr("data-ratio", loadRatio); //设置-首选单位

														body.find("[field='Unit']").find(input).off("click").on("click",function(){
															if(basicUnit && otherUnit) {
																var self = this;
																//定义模版
																var temp = "<div class='unit-list'>";
																temp +="<ul>";
																temp +="<li data-type='basic' data-ratio='1'>" + basicUnit + "</li>";
																temp +="<li data-type='other' data-ratio='" + ratio + "'>" + otherUnit + "</li>";
																temp +="</ul>";
																temp +="</div>";
																if($('.unit-list').length){
																	$('.unit-list').remove(); //如果存在计量单位列表先移除
																}
																else {
																	$(self).after(temp); //加载列表信息
																}
																//计量单位列表的单击事件
																$('.unit-list ul li').off("click").on("click",function(){
																	var unit = $(this).text();
																	var thisRatio = $(this).attr("data-ratio"); //获取比例
																	$(self).val(unit).attr("data-ratio", thisRatio);
																	$(self).keyup(); //模拟键盘操作
																	$('.unit-list').remove(); //移除计量单位列表
																	var stock = body.find("[field='Stock']").find(input).attr("data-stock"); //从缓存中取值
																	var type = $(this).attr("data-type");
																	var UnitPrice = 0;
																	if(type === "basic"){
																		if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "销售退货列表" || listTitle == "其它入库列表") {
																			UnitPrice = basicPresetPriceOne;
																		}
																		else if(listTitle == "销售订单列表" || listTitle == "销售出库列表" || listTitle == "采购退货列表" || listTitle == "其它出库列表" || listTitle == "调拨出库列表") {
																			UnitPrice = basicPresetPriceTwo;
																		}
																		else if(listTitle == "零售出库列表" || listTitle == "零售退货列表"){
																			UnitPrice = retailPriceOne;
																		}
																		body.find("[field='Stock']").find(input).val(stock); //修改库存
																	}
																	else if(type === "other"){
																		if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "销售退货列表" || listTitle == "其它入库列表") {
																			UnitPrice = otherPresetPriceOne;
																		}
																		else if(listTitle == "销售订单列表" || listTitle == "销售出库列表" || listTitle == "采购退货列表" || listTitle == "其它出库列表" || listTitle == "调拨出库列表") {
																			UnitPrice = otherPresetPriceTwo;
																		}
																		else if(listTitle == "零售出库列表" || listTitle == "零售退货列表"){
																			UnitPrice = retailPriceTwo;
																		}
																		// body.find("[field='Stock']").find(input).val((stock/ratio).toFixed(2)); //修改库存
																		body.find("[field='Stock']").find(input).val(stock);
																	}
																	body.find("[field='UnitPrice']").find(input).val(UnitPrice); //单价
																	var OperNumber = body.find("[field='OperNumber']").find(input).val(); //获取数量
																	var taxRate = body.find("[field='TaxRate']").find(input).val(); //获取税率
																	body.find("[field='TaxUnitPrice']").find(input).val((UnitPrice*(1+taxRate/100)).toFixed(2)); //含税单价
																	body.find("[field='AllPrice']").find(input).val((UnitPrice*OperNumber).toFixed(2)); //金额
																	body.find("[field='TaxMoney']").find(input).val((UnitPrice*OperNumber*(taxRate/100)).toFixed(2)); //税额
																	body.find("[field='TaxLastMoney']").find(input).val((UnitPrice*OperNumber*(1+taxRate/100)).toFixed(2)); //价税合计
																	statisticsFun(body,UnitPrice,OperNumber,footer,taxRate);
																});
																//点击空白处移除计量单位列表
																$(".datagrid-body").off("click").on("click",function(){
																	$('.unit-list').remove(); //移除计量单位列表
																});
															}
														});
													}
													var detailPrice = 0; //明细列表-单价
													if(listSubType == "零售" || listSubType == "零售退货") {
														if(res.data[0].unit) { //如果存在计量单位信息
															detailPrice = retailPrice;
														}
														else {
															if (firstOutUnit == basicUnit) {
																detailPrice = retailPriceOne;
															}
															else if (firstOutUnit == otherUnit) {
																detailPrice = retailPriceTwo;
															}
														}
													}
													else if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "销售退货列表" || listTitle == "其它入库列表") {
														if(res.data[0].unit) { //如果存在计量单位信息
															detailPrice = presetPriceOne;
														}
														else {
															if (firstInUnit == basicUnit) {
																detailPrice = basicPresetPriceOne;
															}
															else if (firstInUnit == otherUnit) {
																detailPrice = otherPresetPriceOne;
															}
														}
													}
													else if(listTitle == "销售订单列表" || listTitle == "销售出库列表" || listTitle == "采购退货列表" || listTitle == "其它出库列表" || listTitle == "调拨出库列表") {
														if(res.data[0].unit) { //如果存在计量单位信息
															detailPrice = presetPriceTwo;
														}
														else {
															if(firstOutUnit==basicUnit) {
																detailPrice = basicPresetPriceTwo;
															}
															else if(firstOutUnit==otherUnit){
																detailPrice = otherPresetPriceTwo;
															}
														}
													}
													body.find("[field='OperNumber']").find(input).val(1); //数量初始化为1
													//单价和总价赋值
													if(!detailPrice) {
														detailPrice = 0;
													}
													body.find("[field='UnitPrice']").find(input).val(detailPrice);
													body.find("[field='AllPrice']").find(input).val(detailPrice);
													var taxRate = body.find("[field='TaxRate']").find(input).val()-0; //获取税率
													body.find("[field='TaxUnitPrice']").find(input).val((detailPrice*(1+taxRate/100)).toFixed(2));  //含税单价
													body.find("[field='TaxMoney']").find(input).val((detailPrice*(taxRate/100)).toFixed(2));  //税额
													body.find("[field='TaxLastMoney']").find(input).val((detailPrice*(1+taxRate/100)).toFixed(2));  //价税合计
													body.find("[field='conyract_money']").find(input).val((detailPrice*(1+taxRate/100)).toFixed(2));  //合同价格
													if (res.data[0].name == "套餐一（人脸识别考勤机2台、三辊闸机1台）") {
														body.find("[field='machine_number']").find(input).val("2");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "套餐二（人脸识别考勤机2台、三辊闸机2台）"){
														body.find("[field='machine_number']").find(input).val("2");
														body.find("[field='gate_number']").find(input).val("2");
													} else if (res.data[0].name ==  "套餐三（人脸识别考勤机4台、三辊闸机2台）"){
														body.find("[field='machine_number']").find(input).val("4");
														body.find("[field='gate_number']").find(input).val("2");
													} else if (res.data[0].name ==  "套餐四（人脸识别考勤机3台、三辊闸机3台）"){
														body.find("[field='machine_number']").find(input).val("3");
														body.find("[field='gate_number']").find(input).val("3");
													} else if (res.data[0].name ==  "套餐五（人脸识别考勤机6台、三辊闸机3台）"){
														body.find("[field='machine_number']").find(input).val("6");
														body.find("[field='gate_number']").find(input).val("3");
													} else if (res.data[0].name ==  "产品四（三辊闸1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品五（翼闸单机芯1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品六（翼闸双机芯1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品七（全高闸单通道1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品八（全高闸双通道1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品三（人证信息采集设备1台）"){
														body.find("[field='machine_number']").find(input).val("1");
														body.find("[field='gate_number']").find(input).val("0");
													} else if (res.data[0].name ==  "产品二（固定式人脸识别考勤机1台）"){
														body.find("[field='machine_number']").find(input).val("1");
														body.find("[field='gate_number']").find(input).val("0");
													} else if (res.data[0].name ==  "产品一（移动式人脸识别考勤平板1台）"){
														body.find("[field='machine_number']").find(input).val("1");
														body.find("[field='gate_number']").find(input).val("0");
													}
													statisticsFun(body,detailPrice,1,footer,taxRate);

													//查询库存信息
													var depotId = body.find("[field='DepotId']").find(".combo-value").val();
													if(depotId) {
														var type = "select"; //type 类型：点击 click，选择 select
														findStockNumById(depotId, mId, monthTime, body, input, loadRatio, type);
													}
												}
											},
											error: function() {
												$.messager.alert('页面加载提示','页面加载异常，请稍后再试！','error');
											}
										});
									}
								}
							}
						}
					},
					{ title: '库存',field: 'Stock',editor:'validatebox',width:70},
					{ title: anotherDepotHeadName, field: 'AnotherDepotId',editor:'validatebox',hidden:isShowAnotherDepot,width:90,
						formatter: function (value, row, index) {
							return row.AnotherDepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: anotherDepotTextField,
								method: 'get',
								url: anotherDepotUrl,
								readonly : true,
							}
						}
					},
					{ title: '单位',field: 'Unit',editor:'validatebox',width:60},
					{ title: '数量',field: 'OperNumber',editor:'validatebox',width:60},
					{ title: '单价',field: 'UnitPrice',editor:'validatebox',width:60},
					{ title: '含税单价',field: 'TaxUnitPrice',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '金额',field: 'AllPrice',editor:'validatebox',width:90},
					{ title: '税率(%)',field: 'TaxRate',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '税额',field: 'TaxMoney',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '价税合计',field: 'TaxLastMoney',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '合同',field: 'contract',editor:'validatebox',width:78,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: '/depot/findDepot',
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '收款',field: 'payment',editor:'validatebox',width:78,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: '/depot/findDepot',
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '发票',field: 'invoice',editor:'validatebox',width:78,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: '/depot/findDepot',
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '发货',field: 'gate',editor:'validatebox',width:78,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: '/depot/findDepot',
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '安装',field: 'install',editor:'validatebox',width:78,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: '/depot/findDepot',
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '人脸机类型',field: 'machine_type',editor:'validatebox',width:78},
					{ title: '人脸机数量',field: 'machine_number',editor:'validatebox',width:78},
					{ title: '闸机类型',field: 'gate_type',editor:'validatebox' ,width:78},
					{ title: '闸机数量',field: 'gate_number',editor:'validatebox',width:78},
					{ title: '品名-别',field: 'OtherField1',editor:'validatebox',hidden:otherColumns,width:60},
					{ title: '型号-别',field: 'OtherField2',editor:'validatebox',hidden:otherColumns,width:60},
					{ title: '颜色-别',field: 'OtherField3',editor:'validatebox',hidden:otherColumns,width:60},
					{ title: '备注1',field: 'OtherField4',editor:'validatebox',hidden:true,width:60},
					{ title: '备注2',field: 'OtherField5',editor:'validatebox',hidden:true,width:60}
				]],
				toolbar:[
					{
						id:'append',
						text:'新增行',
						iconCls:'icon-add',
						handler:function() {
							append(); //新增行
						}
					},
					{
						id:'delete',
						text:'删除行',
						iconCls:'icon-remove',
						handler:function() {
							batchDel(); //删除行
						}
					},
					{
						id:'reject',
						text:'撤销',
						iconCls:'icon-undo',
						handler:function() {
							reject(); //撤销
						}
					}
					// ,
					// {
					//     id:'appendDepot',
					//     text:'新增仓库',
					//     iconCls:'icon-add',
					//     handler:function() {
					//         appendDepot(); //新增仓库
					//     }
					// }
					// ,
					// {
					//     id:'appendMaterial',
					//     text:'新增商品',
					//     iconCls:'icon-add',
					//     handler:function() {
					//         appendMaterial(); //新增商品
					//     }
					// }
				],
				onLoadError:function()
				{
					$.messager.alert('页面加载提示','页面加载异常，请稍后再试！','error');
					return;
				}
			});
		}else if(roleID == 17){
			$('#materialData').datagrid({
				height:245,
				rownumbers: false,
				//动画效果
				animate:false,
				//选中单行
				singleSelect : true,
				collapsible:false,
				selectOnCheck:false,
				//单击行是否选中
				checkOnSelect : false,
				pagination: false,
				//交替出现背景
				striped : true,
				showFooter: true,
				//loadFilter: pagerFilter,
				onClickRow: onClickRow,
				columns:[[
					{ field: 'Id',width:35,align:"center",checkbox:true},
					{ title: '商品类型',field: 'MType',editor:'validatebox',hidden:isShowMaterialTypeColumn,width:80},
					{ title: depotHeadName, field: 'DepotId', editor: 'validatebox', width: 90,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: depotUrl,
								readonly : true,
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '订单类型',field: 'order_type',editor:'validatebox',width:78,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: '/depot/findDepotByUserId?UBType=1&UBKeyId='+kid,
								readonly : true,
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '品名(型号)(扩展信息)(单位)',field: 'MaterialId',width:160,
						formatter:function(value,row,index){
							return row.MaterialName;
						},
						editor:{
							type:'combobox',
							options:{
								valueField:'Id',
								textField:'MaterialName',
								method:'get',
								url: "/material/findBySelect",
								panelWidth: 300, //下拉框的宽度
								readonly : true,
								//全面模糊匹配，过滤字段
								filter: function(q, row){
									var opts = $(this).combobox('options');
									return row[opts.textField].indexOf(q) >-1;
								},
								onBeforeLoad: function(param){
									param.mpList = mPropertyList; //商品属性
								},
								change:function(){
									var machine_type = [field='OperNumber'];


								},
								onSelect:function(rec){
									if(rec) {
										var mId = rec.Id;
										$.ajax({
											url: "/material/findById",
											type: "get",
											dataType: "json",
											data: {
												id: mId
											},
											success: function (res) {;
												if(res && res.code === 200 && res.data && res.data[0]) {
													var retailPrice = res.data[0].retailprice-0; //零售价格
													var presetPriceOne = res.data[0].presetpriceone-0; //预计采购价
													var presetPriceTwo = res.data[0].presetpricetwo-0; //批发价
													var firstInUnit = res.data[0].firstinunit; //首选入库单位
													var firstOutUnit = res.data[0].firstoutunit; //首选出库单位
													var basicPresetPriceOne = ""; //多单位-入库-基础价格
													var basicPresetPriceTwo = ""; //多单位-出库-基础价格
													var retailPriceOne = ""; //多单位-入库-零售价格
													var otherPresetPriceOne = ""; //多单位-入库-其他价格
													var otherPresetPriceTwo = ""; //多单位-出库-其他价格
													var retailPriceTwo = ""; //多单位-出库-零售价格
													var basicUnit = ""; //基础单位
													var otherUnit = ""; //其他单位
													if(!res.data[0].unit){
														var ps = res.data[0].pricestrategy;
														var psObj = JSON.parse(ps);
														basicPresetPriceOne = psObj[0].basic.PresetPriceOne-0;
														basicPresetPriceTwo = psObj[0].basic.PresetPriceTwo-0;
														retailPriceOne = psObj[0].basic.RetailPrice-0;
														otherPresetPriceOne = psObj[1].other.PresetPriceOne-0;
														otherPresetPriceTwo = psObj[1].other.PresetPriceTwo-0;
														retailPriceTwo = psObj[1].other.RetailPrice-0;
														basicUnit = psObj[0].basic.Unit;
														otherUnit = psObj[1].other.Unit;
													}
													body =$("#depotHeadFM .datagrid-body");
													footer =$("#depotHeadFM .datagrid-footer");
													input = ".datagrid-editable-input";
													if(res.data[0].unit){ //如果存在计量单位信息
														ratio = 1; //重置比例为1
														body.find("[field='Unit']").find(input).val(res.data[0].unit); //设置-计量单位信息
														body.find("[field='Unit']").find(input).prop("readonly","readonly"); //设置计量单位为只读
														body.find("[field='Unit']").find(input).off("click"); //移除点击事件
														body.find("[field='Unit']").find(input).attr("data-ratio",ratio); //修改比例缓存信息
													}
													else {
														var unitName = res.data[0].unitName;
														if(unitName) {
															ratio = unitName.substring(unitName.indexOf(":")+1).replace(")",""); //给比例赋值
															unitName = unitName.substring(0, unitName.indexOf("("));
														}
														var unitArr = unitName.split(",");
														var basicUnit = unitArr[0]; //基础单位
														var otherUnit = unitArr[1]; //副单位
														var unitSetInput =""; //单位
														body.find("[field='Unit']").find(input).prop("readonly","readonly"); //设置计量单位为只读
														var loadRatio = 1; //在单位输入框上面加载比例字段
														if(listSubType === "采购" || listSubType === "采购退货" || listSubType === "采购订单"){
															unitSetInput = res.data[0].firstinunit; //给单位文本框赋值
															if(basicUnit==unitSetInput){ //基础单位等于选择的单位
																loadRatio = 1;
															}
															else if(otherUnit==unitSetInput){ //副单位等于选择的单位
																loadRatio = ratio;
															}
														}
														else if(listSubType === "销售" || listSubType === "销售退货" || listSubType === "销售订单" || listSubType === "零售" || listSubType === "零售退货"){
															unitSetInput = res.data[0].firstoutunit; //给单位文本框赋值
															if(basicUnit==unitSetInput){ //基础单位等于选择的单位
																loadRatio = 1;
															}
															else if(otherUnit==unitSetInput){ //副单位等于选择的单位
																loadRatio = ratio;
															}
														}
														body.find("[field='Unit']").find(input).val(unitSetInput).attr("data-ratio", loadRatio); //设置-首选单位

														body.find("[field='Unit']").find(input).off("click").on("click",function(){
															if(basicUnit && otherUnit) {
																var self = this;
																//定义模版
																var temp = "<div class='unit-list'>";
																temp +="<ul>";
																temp +="<li data-type='basic' data-ratio='1'>" + basicUnit + "</li>";
																temp +="<li data-type='other' data-ratio='" + ratio + "'>" + otherUnit + "</li>";
																temp +="</ul>";
																temp +="</div>";
																if($('.unit-list').length){
																	$('.unit-list').remove(); //如果存在计量单位列表先移除
																}
																else {
																	$(self).after(temp); //加载列表信息
																}
																//计量单位列表的单击事件
																$('.unit-list ul li').off("click").on("click",function(){
																	var unit = $(this).text();
																	var thisRatio = $(this).attr("data-ratio"); //获取比例
																	$(self).val(unit).attr("data-ratio", thisRatio);
																	$(self).keyup(); //模拟键盘操作
																	$('.unit-list').remove(); //移除计量单位列表
																	var stock = body.find("[field='Stock']").find(input).attr("data-stock"); //从缓存中取值
																	var type = $(this).attr("data-type");
																	var UnitPrice = 0;
																	if(type === "basic"){
																		if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "销售退货列表" || listTitle == "其它入库列表") {
																			UnitPrice = basicPresetPriceOne;
																		}
																		else if(listTitle == "销售订单列表" || listTitle == "销售出库列表" || listTitle == "采购退货列表" || listTitle == "其它出库列表" || listTitle == "调拨出库列表") {
																			UnitPrice = basicPresetPriceTwo;
																		}
																		else if(listTitle == "零售出库列表" || listTitle == "零售退货列表"){
																			UnitPrice = retailPriceOne;
																		}
																		body.find("[field='Stock']").find(input).val(stock); //修改库存
																	}
																	else if(type === "other"){
																		if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "销售退货列表" || listTitle == "其它入库列表") {
																			UnitPrice = otherPresetPriceOne;
																		}
																		else if(listTitle == "销售订单列表" || listTitle == "销售出库列表" || listTitle == "采购退货列表" || listTitle == "其它出库列表" || listTitle == "调拨出库列表") {
																			UnitPrice = otherPresetPriceTwo;
																		}
																		else if(listTitle == "零售出库列表" || listTitle == "零售退货列表"){
																			UnitPrice = retailPriceTwo;
																		}
																		// body.find("[field='Stock']").find(input).val((stock/ratio).toFixed(2)); //修改库存
																		body.find("[field='Stock']").find(input).val(stock);
																	}
																	body.find("[field='UnitPrice']").find(input).val(UnitPrice); //单价
																	var OperNumber = body.find("[field='OperNumber']").find(input).val(); //获取数量
																	var taxRate = body.find("[field='TaxRate']").find(input).val(); //获取税率
																	body.find("[field='TaxUnitPrice']").find(input).val((UnitPrice*(1+taxRate/100)).toFixed(2)); //含税单价
																	body.find("[field='AllPrice']").find(input).val((UnitPrice*OperNumber).toFixed(2)); //金额
																	body.find("[field='TaxMoney']").find(input).val((UnitPrice*OperNumber*(taxRate/100)).toFixed(2)); //税额
																	body.find("[field='TaxLastMoney']").find(input).val((UnitPrice*OperNumber*(1+taxRate/100)).toFixed(2)); //价税合计
																	statisticsFun(body,UnitPrice,OperNumber,footer,taxRate);
																});
																//点击空白处移除计量单位列表
																$(".datagrid-body").off("click").on("click",function(){
																	$('.unit-list').remove(); //移除计量单位列表
																});
															}
														});
													}
													var detailPrice = 0; //明细列表-单价
													if(listSubType == "零售" || listSubType == "零售退货") {
														if(res.data[0].unit) { //如果存在计量单位信息
															detailPrice = retailPrice;
														}
														else {
															if (firstOutUnit == basicUnit) {
																detailPrice = retailPriceOne;
															}
															else if (firstOutUnit == otherUnit) {
																detailPrice = retailPriceTwo;
															}
														}
													}
													else if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "销售退货列表" || listTitle == "其它入库列表") {
														if(res.data[0].unit) { //如果存在计量单位信息
															detailPrice = presetPriceOne;
														}
														else {
															if (firstInUnit == basicUnit) {
																detailPrice = basicPresetPriceOne;
															}
															else if (firstInUnit == otherUnit) {
																detailPrice = otherPresetPriceOne;
															}
														}
													}
													else if(listTitle == "销售订单列表" || listTitle == "销售出库列表" || listTitle == "采购退货列表" || listTitle == "其它出库列表" || listTitle == "调拨出库列表") {
														if(res.data[0].unit) { //如果存在计量单位信息
															detailPrice = presetPriceTwo;
														}
														else {
															if(firstOutUnit==basicUnit) {
																detailPrice = basicPresetPriceTwo;
															}
															else if(firstOutUnit==otherUnit){
																detailPrice = otherPresetPriceTwo;
															}
														}
													}
													body.find("[field='OperNumber']").find(input).val(1); //数量初始化为1
													//单价和总价赋值
													if(!detailPrice) {
														detailPrice = 0;
													}
													body.find("[field='UnitPrice']").find(input).val(detailPrice);
													body.find("[field='AllPrice']").find(input).val(detailPrice);
													var taxRate = body.find("[field='TaxRate']").find(input).val()-0; //获取税率
													body.find("[field='TaxUnitPrice']").find(input).val((detailPrice*(1+taxRate/100)).toFixed(2));  //含税单价
													body.find("[field='TaxMoney']").find(input).val((detailPrice*(taxRate/100)).toFixed(2));  //税额
													body.find("[field='TaxLastMoney']").find(input).val((detailPrice*(1+taxRate/100)).toFixed(2));  //价税合计
													body.find("[field='conyract_money']").find(input).val((detailPrice*(1+taxRate/100)).toFixed(2));  //合同价格
													if (res.data[0].name == "套餐一（人脸识别考勤机2台、三辊闸机1台）") {
														body.find("[field='machine_number']").find(input).val("2");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "套餐二（人脸识别考勤机2台、三辊闸机2台）"){
														body.find("[field='machine_number']").find(input).val("2");
														body.find("[field='gate_number']").find(input).val("2");
													} else if (res.data[0].name ==  "套餐三（人脸识别考勤机4台、三辊闸机2台）"){
														body.find("[field='machine_number']").find(input).val("4");
														body.find("[field='gate_number']").find(input).val("2");
													} else if (res.data[0].name ==  "套餐四（人脸识别考勤机3台、三辊闸机3台）"){
														body.find("[field='machine_number']").find(input).val("3");
														body.find("[field='gate_number']").find(input).val("3");
													} else if (res.data[0].name ==  "套餐五（人脸识别考勤机6台、三辊闸机3台）"){
														body.find("[field='machine_number']").find(input).val("6");
														body.find("[field='gate_number']").find(input).val("3");
													} else if (res.data[0].name ==  "产品四（三辊闸1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品五（翼闸单机芯1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品六（翼闸双机芯1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品七（全高闸单通道1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品八（全高闸双通道1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品三（人证信息采集设备1台）"){
														body.find("[field='machine_number']").find(input).val("1");
														body.find("[field='gate_number']").find(input).val("0");
													} else if (res.data[0].name ==  "产品二（固定式人脸识别考勤机1台）"){
														body.find("[field='machine_number']").find(input).val("1");
														body.find("[field='gate_number']").find(input).val("0");
													} else if (res.data[0].name ==  "产品一（移动式人脸识别考勤平板1台）"){
														body.find("[field='machine_number']").find(input).val("1");
														body.find("[field='gate_number']").find(input).val("0");
													}
													statisticsFun(body,detailPrice,1,footer,taxRate);

													//查询库存信息
													var depotId = body.find("[field='DepotId']").find(".combo-value").val();
													if(depotId) {
														var type = "select"; //type 类型：点击 click，选择 select
														findStockNumById(depotId, mId, monthTime, body, input, loadRatio, type);
													}
												}
											},
											error: function() {
												$.messager.alert('页面加载提示','页面加载异常，请稍后再试！','error');
											}
										});
									}
								}
							}
						}
					},
					// { title: '库存',field: 'Stock',editor:'validatebox',width:70},
					{ title: anotherDepotHeadName, field: 'AnotherDepotId',editor:'validatebox',hidden:isShowAnotherDepot,width:90,
						formatter: function (value, row, index) {
							return row.AnotherDepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: anotherDepotTextField,
								method: 'get',
								url: anotherDepotUrl,
								readonly : true,
							}
						}
					},
					{ title: '单位',field: 'Unit',editor:'validatebox',width:60},
					{ title: '数量',field: 'OperNumber',editor:'validatebox',width:60},
					{ title: '单价',field: 'UnitPrice',editor:'validatebox',width:60},
					{ title: '含税单价',field: 'TaxUnitPrice',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '金额',field: 'AllPrice',editor:'validatebox',width:90},
					{ title: '税率(%)',field: 'TaxRate',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '税额',field: 'TaxMoney',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '价税合计',field: 'TaxLastMoney',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '收款',field: 'payment',editor:'validatebox',width:78,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: '/depot/findDepot',
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '发票',field: 'invoice',editor:'validatebox',width:78,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: '/depot/findDepot',
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '人脸机类型',field: 'machine_type',editor:'validatebox',width:78},
					{ title: '人脸机数量',field: 'machine_number',editor:'validatebox',width:78},
					{ title: '闸机类型',field: 'gate_type',editor:'validatebox' ,width:78},
					{ title: '闸机数量',field: 'gate_number',editor:'validatebox',width:78},
					{ title: '品名-别',field: 'OtherField1',editor:'validatebox',hidden:otherColumns,width:60},
					{ title: '型号-别',field: 'OtherField2',editor:'validatebox',hidden:otherColumns,width:60},
					{ title: '颜色-别',field: 'OtherField3',editor:'validatebox',hidden:otherColumns,width:60},
					{ title: '备注1',field: 'OtherField4',editor:'validatebox',hidden:true,width:60},
					{ title: '备注2',field: 'OtherField5',editor:'validatebox',hidden:true,width:60}
				]],
				toolbar:[
					{
						id:'append',
						text:'新增行',
						iconCls:'icon-add',
						handler:function() {
							append(); //新增行
						}
					},
					{
						id:'delete',
						text:'删除行',
						iconCls:'icon-remove',
						handler:function() {
							batchDel(); //删除行
						}
					},
					{
						id:'reject',
						text:'撤销',
						iconCls:'icon-undo',
						handler:function() {
							reject(); //撤销
						}
					}
				],
				onLoadError:function()
				{
					$.messager.alert('页面加载提示','页面加载异常，请稍后再试！','error');
					return;
				}
			});
		}else if(roleID == 18){
			$('#materialData').datagrid({
				height:245,
				rownumbers: false,
				//动画效果
				animate:false,
				//选中单行
				singleSelect : true,
				collapsible:false,
				selectOnCheck:false,
				//单击行是否选中
				checkOnSelect : false,
				pagination: false,
				//交替出现背景
				striped : true,
				showFooter: true,
				//loadFilter: pagerFilter,
				onClickRow: onClickRow,
				columns:[[
					{ field: 'Id',width:35,align:"center",checkbox:true},
					{ title: '商品类型',field: 'MType',editor:'validatebox',hidden:isShowMaterialTypeColumn,width:80},
					{ title: depotHeadName, field: 'DepotId', editor: 'validatebox', width: 90,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: depotUrl,
								readonly : true,
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '订单类型',field: 'order_type',editor:'validatebox',width:78,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: '/depot/findDepotByUserId?UBType=1&UBKeyId='+kid,
								readonly : true,
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '品名(型号)(扩展信息)(单位)',field: 'MaterialId',width:160,
						formatter:function(value,row,index){
							return row.MaterialName;
						},
						editor:{
							type:'combobox',
							options:{
								valueField:'Id',
								textField:'MaterialName',
								method:'get',
								url: "/material/findBySelect",
								panelWidth: 300, //下拉框的宽度
								readonly : true,
								//全面模糊匹配，过滤字段
								filter: function(q, row){
									var opts = $(this).combobox('options');
									return row[opts.textField].indexOf(q) >-1;
								},
								onBeforeLoad: function(param){
									param.mpList = mPropertyList; //商品属性
								},
								change:function(){
									var machine_type = [field='OperNumber'];


								},
								onSelect:function(rec){
									if(rec) {
										var mId = rec.Id;
										$.ajax({
											url: "/material/findById",
											type: "get",
											dataType: "json",
											data: {
												id: mId
											},
											success: function (res) {;
												if(res && res.code === 200 && res.data && res.data[0]) {
													var retailPrice = res.data[0].retailprice-0; //零售价格
													var presetPriceOne = res.data[0].presetpriceone-0; //预计采购价
													var presetPriceTwo = res.data[0].presetpricetwo-0; //批发价
													var firstInUnit = res.data[0].firstinunit; //首选入库单位
													var firstOutUnit = res.data[0].firstoutunit; //首选出库单位
													var basicPresetPriceOne = ""; //多单位-入库-基础价格
													var basicPresetPriceTwo = ""; //多单位-出库-基础价格
													var retailPriceOne = ""; //多单位-入库-零售价格
													var otherPresetPriceOne = ""; //多单位-入库-其他价格
													var otherPresetPriceTwo = ""; //多单位-出库-其他价格
													var retailPriceTwo = ""; //多单位-出库-零售价格
													var basicUnit = ""; //基础单位
													var otherUnit = ""; //其他单位
													if(!res.data[0].unit){
														var ps = res.data[0].pricestrategy;
														var psObj = JSON.parse(ps);
														basicPresetPriceOne = psObj[0].basic.PresetPriceOne-0;
														basicPresetPriceTwo = psObj[0].basic.PresetPriceTwo-0;
														retailPriceOne = psObj[0].basic.RetailPrice-0;
														otherPresetPriceOne = psObj[1].other.PresetPriceOne-0;
														otherPresetPriceTwo = psObj[1].other.PresetPriceTwo-0;
														retailPriceTwo = psObj[1].other.RetailPrice-0;
														basicUnit = psObj[0].basic.Unit;
														otherUnit = psObj[1].other.Unit;
													}
													body =$("#depotHeadFM .datagrid-body");
													footer =$("#depotHeadFM .datagrid-footer");
													input = ".datagrid-editable-input";
													if(res.data[0].unit){ //如果存在计量单位信息
														ratio = 1; //重置比例为1
														body.find("[field='Unit']").find(input).val(res.data[0].unit); //设置-计量单位信息
														body.find("[field='Unit']").find(input).prop("readonly","readonly"); //设置计量单位为只读
														body.find("[field='Unit']").find(input).off("click"); //移除点击事件
														body.find("[field='Unit']").find(input).attr("data-ratio",ratio); //修改比例缓存信息
													}
													else {
														var unitName = res.data[0].unitName;
														if(unitName) {
															ratio = unitName.substring(unitName.indexOf(":")+1).replace(")",""); //给比例赋值
															unitName = unitName.substring(0, unitName.indexOf("("));
														}
														var unitArr = unitName.split(",");
														var basicUnit = unitArr[0]; //基础单位
														var otherUnit = unitArr[1]; //副单位
														var unitSetInput =""; //单位
														body.find("[field='Unit']").find(input).prop("readonly","readonly"); //设置计量单位为只读
														var loadRatio = 1; //在单位输入框上面加载比例字段
														if(listSubType === "采购" || listSubType === "采购退货" || listSubType === "采购订单"){
															unitSetInput = res.data[0].firstinunit; //给单位文本框赋值
															if(basicUnit==unitSetInput){ //基础单位等于选择的单位
																loadRatio = 1;
															}
															else if(otherUnit==unitSetInput){ //副单位等于选择的单位
																loadRatio = ratio;
															}
														}
														else if(listSubType === "销售" || listSubType === "销售退货" || listSubType === "销售订单" || listSubType === "零售" || listSubType === "零售退货"){
															unitSetInput = res.data[0].firstoutunit; //给单位文本框赋值
															if(basicUnit==unitSetInput){ //基础单位等于选择的单位
																loadRatio = 1;
															}
															else if(otherUnit==unitSetInput){ //副单位等于选择的单位
																loadRatio = ratio;
															}
														}
														body.find("[field='Unit']").find(input).val(unitSetInput).attr("data-ratio", loadRatio); //设置-首选单位

														body.find("[field='Unit']").find(input).off("click").on("click",function(){
															if(basicUnit && otherUnit) {
																var self = this;
																//定义模版
																var temp = "<div class='unit-list'>";
																temp +="<ul>";
																temp +="<li data-type='basic' data-ratio='1'>" + basicUnit + "</li>";
																temp +="<li data-type='other' data-ratio='" + ratio + "'>" + otherUnit + "</li>";
																temp +="</ul>";
																temp +="</div>";
																if($('.unit-list').length){
																	$('.unit-list').remove(); //如果存在计量单位列表先移除
																}
																else {
																	$(self).after(temp); //加载列表信息
																}
																//计量单位列表的单击事件
																$('.unit-list ul li').off("click").on("click",function(){
																	var unit = $(this).text();
																	var thisRatio = $(this).attr("data-ratio"); //获取比例
																	$(self).val(unit).attr("data-ratio", thisRatio);
																	$(self).keyup(); //模拟键盘操作
																	$('.unit-list').remove(); //移除计量单位列表
																	var stock = body.find("[field='Stock']").find(input).attr("data-stock"); //从缓存中取值
																	var type = $(this).attr("data-type");
																	var UnitPrice = 0;
																	if(type === "basic"){
																		if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "销售退货列表" || listTitle == "其它入库列表") {
																			UnitPrice = basicPresetPriceOne;
																		}
																		else if(listTitle == "销售订单列表" || listTitle == "销售出库列表" || listTitle == "采购退货列表" || listTitle == "其它出库列表" || listTitle == "调拨出库列表") {
																			UnitPrice = basicPresetPriceTwo;
																		}
																		else if(listTitle == "零售出库列表" || listTitle == "零售退货列表"){
																			UnitPrice = retailPriceOne;
																		}
																		body.find("[field='Stock']").find(input).val(stock); //修改库存
																	}
																	else if(type === "other"){
																		if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "销售退货列表" || listTitle == "其它入库列表") {
																			UnitPrice = otherPresetPriceOne;
																		}
																		else if(listTitle == "销售订单列表" || listTitle == "销售出库列表" || listTitle == "采购退货列表" || listTitle == "其它出库列表" || listTitle == "调拨出库列表") {
																			UnitPrice = otherPresetPriceTwo;
																		}
																		else if(listTitle == "零售出库列表" || listTitle == "零售退货列表"){
																			UnitPrice = retailPriceTwo;
																		}
																		// body.find("[field='Stock']").find(input).val((stock/ratio).toFixed(2)); //修改库存
																		body.find("[field='Stock']").find(input).val(stock);
																	}
																	body.find("[field='UnitPrice']").find(input).val(UnitPrice); //单价
																	var OperNumber = body.find("[field='OperNumber']").find(input).val(); //获取数量
																	var taxRate = body.find("[field='TaxRate']").find(input).val(); //获取税率
																	body.find("[field='TaxUnitPrice']").find(input).val((UnitPrice*(1+taxRate/100)).toFixed(2)); //含税单价
																	body.find("[field='AllPrice']").find(input).val((UnitPrice*OperNumber).toFixed(2)); //金额
																	body.find("[field='TaxMoney']").find(input).val((UnitPrice*OperNumber*(taxRate/100)).toFixed(2)); //税额
																	body.find("[field='TaxLastMoney']").find(input).val((UnitPrice*OperNumber*(1+taxRate/100)).toFixed(2)); //价税合计
																	statisticsFun(body,UnitPrice,OperNumber,footer,taxRate);
																});
																//点击空白处移除计量单位列表
																$(".datagrid-body").off("click").on("click",function(){
																	$('.unit-list').remove(); //移除计量单位列表
																});
															}
														});
													}
													var detailPrice = 0; //明细列表-单价
													if(listSubType == "零售" || listSubType == "零售退货") {
														if(res.data[0].unit) { //如果存在计量单位信息
															detailPrice = retailPrice;
														}
														else {
															if (firstOutUnit == basicUnit) {
																detailPrice = retailPriceOne;
															}
															else if (firstOutUnit == otherUnit) {
																detailPrice = retailPriceTwo;
															}
														}
													}
													else if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "销售退货列表" || listTitle == "其它入库列表") {
														if(res.data[0].unit) { //如果存在计量单位信息
															detailPrice = presetPriceOne;
														}
														else {
															if (firstInUnit == basicUnit) {
																detailPrice = basicPresetPriceOne;
															}
															else if (firstInUnit == otherUnit) {
																detailPrice = otherPresetPriceOne;
															}
														}
													}
													else if(listTitle == "销售订单列表" || listTitle == "销售出库列表" || listTitle == "采购退货列表" || listTitle == "其它出库列表" || listTitle == "调拨出库列表") {
														if(res.data[0].unit) { //如果存在计量单位信息
															detailPrice = presetPriceTwo;
														}
														else {
															if(firstOutUnit==basicUnit) {
																detailPrice = basicPresetPriceTwo;
															}
															else if(firstOutUnit==otherUnit){
																detailPrice = otherPresetPriceTwo;
															}
														}
													}
													body.find("[field='OperNumber']").find(input).val(1); //数量初始化为1
													//单价和总价赋值
													if(!detailPrice) {
														detailPrice = 0;
													}
													body.find("[field='UnitPrice']").find(input).val(detailPrice);
													body.find("[field='AllPrice']").find(input).val(detailPrice);
													var taxRate = body.find("[field='TaxRate']").find(input).val()-0; //获取税率
													body.find("[field='TaxUnitPrice']").find(input).val((detailPrice*(1+taxRate/100)).toFixed(2));  //含税单价
													body.find("[field='TaxMoney']").find(input).val((detailPrice*(taxRate/100)).toFixed(2));  //税额
													body.find("[field='TaxLastMoney']").find(input).val((detailPrice*(1+taxRate/100)).toFixed(2));  //价税合计
													body.find("[field='conyract_money']").find(input).val((detailPrice*(1+taxRate/100)).toFixed(2));  //合同价格
													if (res.data[0].name == "套餐一（人脸识别考勤机2台、三辊闸机1台）") {
														body.find("[field='machine_number']").find(input).val("2");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "套餐二（人脸识别考勤机2台、三辊闸机2台）"){
														body.find("[field='machine_number']").find(input).val("2");
														body.find("[field='gate_number']").find(input).val("2");
													} else if (res.data[0].name ==  "套餐三（人脸识别考勤机4台、三辊闸机2台）"){
														body.find("[field='machine_number']").find(input).val("4");
														body.find("[field='gate_number']").find(input).val("2");
													} else if (res.data[0].name ==  "套餐四（人脸识别考勤机3台、三辊闸机3台）"){
														body.find("[field='machine_number']").find(input).val("3");
														body.find("[field='gate_number']").find(input).val("3");
													} else if (res.data[0].name ==  "套餐五（人脸识别考勤机6台、三辊闸机3台）"){
														body.find("[field='machine_number']").find(input).val("6");
														body.find("[field='gate_number']").find(input).val("3");
													} else if (res.data[0].name ==  "产品四（三辊闸1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品五（翼闸单机芯1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品六（翼闸双机芯1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品七（全高闸单通道1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品八（全高闸双通道1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品三（人证信息采集设备1台）"){
														body.find("[field='machine_number']").find(input).val("1");
														body.find("[field='gate_number']").find(input).val("0");
													} else if (res.data[0].name ==  "产品二（固定式人脸识别考勤机1台）"){
														body.find("[field='machine_number']").find(input).val("1");
														body.find("[field='gate_number']").find(input).val("0");
													} else if (res.data[0].name ==  "产品一（移动式人脸识别考勤平板1台）"){
														body.find("[field='machine_number']").find(input).val("1");
														body.find("[field='gate_number']").find(input).val("0");
													}
													statisticsFun(body,detailPrice,1,footer,taxRate);

													//查询库存信息
													var depotId = body.find("[field='DepotId']").find(".combo-value").val();
													if(depotId) {
														var type = "select"; //type 类型：点击 click，选择 select
														findStockNumById(depotId, mId, monthTime, body, input, loadRatio, type);
													}
												}
											},
											error: function() {
												$.messager.alert('页面加载提示','页面加载异常，请稍后再试！','error');
											}
										});
									}
								}
							}
						}
					},
					{ title: '库存',field: 'Stock',editor:'validatebox',width:70},
					{ title: anotherDepotHeadName, field: 'AnotherDepotId',editor:'validatebox',hidden:isShowAnotherDepot,width:90,
						formatter: function (value, row, index) {
							return row.AnotherDepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: anotherDepotTextField,
								method: 'get',
								url: anotherDepotUrl,
								readonly : true,
							}
						}
					},
					{ title: '单位',field: 'Unit',editor:'validatebox',width:60},
					{ title: '数量',field: 'OperNumber',editor:'validatebox',width:60},
					{ title: '单价',field: 'UnitPrice',editor:'validatebox',width:60},
					{ title: '含税单价',field: 'TaxUnitPrice',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '金额',field: 'AllPrice',editor:'validatebox',width:90},
					{ title: '税率(%)',field: 'TaxRate',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '税额',field: 'TaxMoney',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '价税合计',field: 'TaxLastMoney',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '合同',field: 'contract',editor:'validatebox',width:78,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: '/depot/findDepot',
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '人脸机类型',field: 'machine_type',editor:'validatebox',width:78},
					{ title: '人脸机数量',field: 'machine_number',editor:'validatebox',width:78},
					{ title: '闸机类型',field: 'gate_type',editor:'validatebox' ,width:78},
					{ title: '闸机数量',field: 'gate_number',editor:'validatebox',width:78},
					{ title: '品名-别',field: 'OtherField1',editor:'validatebox',hidden:otherColumns,width:60},
					{ title: '型号-别',field: 'OtherField2',editor:'validatebox',hidden:otherColumns,width:60},
					{ title: '颜色-别',field: 'OtherField3',editor:'validatebox',hidden:otherColumns,width:60},
					{ title: '备注1',field: 'OtherField4',editor:'validatebox',hidden:true,width:60},
					{ title: '备注2',field: 'OtherField5',editor:'validatebox',hidden:true,width:60}
				]],
				toolbar:[
					{
						id:'append',
						text:'新增行',
						iconCls:'icon-add',
						handler:function() {
							append(); //新增行
						}
					},
					{
						id:'delete',
						text:'删除行',
						iconCls:'icon-remove',
						handler:function() {
							batchDel(); //删除行
						}
					},
					{
						id:'reject',
						text:'撤销',
						iconCls:'icon-undo',
						handler:function() {
							reject(); //撤销
						}
					}
				],
				onLoadError:function()
				{
					$.messager.alert('页面加载提示','页面加载异常，请稍后再试！','error');
					return;
				}
			});
		}else if(roleID == 24){
			$('#materialData').datagrid({
				height:245,
				rownumbers: false,
				//动画效果
				animate:false,
				//选中单行
				singleSelect : true,
				collapsible:false,
				selectOnCheck:false,
				//单击行是否选中
				checkOnSelect : false,
				pagination: false,
				//交替出现背景
				striped : true,
				showFooter: true,
				//loadFilter: pagerFilter,
				onClickRow: onClickRow,
				columns:[[
					{ field: 'Id',width:35,align:"center",checkbox:true},
					{ title: '商品类型',field: 'MType',editor:'validatebox',hidden:isShowMaterialTypeColumn,width:80},
					{ title: depotHeadName, field: 'DepotId', editor: 'validatebox', width: 90,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: depotUrl,
								readonly : true,
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '订单类型',field: 'order_type',editor:'validatebox',width:78,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: '/depot/findDepotByUserId?UBType=1&UBKeyId='+kid,
								readonly : true,
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '品名(型号)(扩展信息)(单位)',field: 'MaterialId',width:160,
						formatter:function(value,row,index){
							return row.MaterialName;
						},
						editor:{
							type:'combobox',
							options:{
								valueField:'Id',
								textField:'MaterialName',
								method:'get',
								url: "/material/findBySelect",
								panelWidth: 300, //下拉框的宽度
								readonly : true,
								//全面模糊匹配，过滤字段
								filter: function(q, row){
									var opts = $(this).combobox('options');
									return row[opts.textField].indexOf(q) >-1;
								},
								onBeforeLoad: function(param){
									param.mpList = mPropertyList; //商品属性
								},
								change:function(){
									var machine_type = [field='OperNumber'];


								},
								onSelect:function(rec){
									if(rec) {
										var mId = rec.Id;
										$.ajax({
											url: "/material/findById",
											type: "get",
											dataType: "json",
											data: {
												id: mId
											},
											success: function (res) {;
												if(res && res.code === 200 && res.data && res.data[0]) {
													var retailPrice = res.data[0].retailprice-0; //零售价格
													var presetPriceOne = res.data[0].presetpriceone-0; //预计采购价
													var presetPriceTwo = res.data[0].presetpricetwo-0; //批发价
													var firstInUnit = res.data[0].firstinunit; //首选入库单位
													var firstOutUnit = res.data[0].firstoutunit; //首选出库单位
													var basicPresetPriceOne = ""; //多单位-入库-基础价格
													var basicPresetPriceTwo = ""; //多单位-出库-基础价格
													var retailPriceOne = ""; //多单位-入库-零售价格
													var otherPresetPriceOne = ""; //多单位-入库-其他价格
													var otherPresetPriceTwo = ""; //多单位-出库-其他价格
													var retailPriceTwo = ""; //多单位-出库-零售价格
													var basicUnit = ""; //基础单位
													var otherUnit = ""; //其他单位
													if(!res.data[0].unit){
														var ps = res.data[0].pricestrategy;
														var psObj = JSON.parse(ps);
														basicPresetPriceOne = psObj[0].basic.PresetPriceOne-0;
														basicPresetPriceTwo = psObj[0].basic.PresetPriceTwo-0;
														retailPriceOne = psObj[0].basic.RetailPrice-0;
														otherPresetPriceOne = psObj[1].other.PresetPriceOne-0;
														otherPresetPriceTwo = psObj[1].other.PresetPriceTwo-0;
														retailPriceTwo = psObj[1].other.RetailPrice-0;
														basicUnit = psObj[0].basic.Unit;
														otherUnit = psObj[1].other.Unit;
													}
													body =$("#depotHeadFM .datagrid-body");
													footer =$("#depotHeadFM .datagrid-footer");
													input = ".datagrid-editable-input";
													if(res.data[0].unit){ //如果存在计量单位信息
														ratio = 1; //重置比例为1
														body.find("[field='Unit']").find(input).val(res.data[0].unit); //设置-计量单位信息
														body.find("[field='Unit']").find(input).prop("readonly","readonly"); //设置计量单位为只读
														body.find("[field='Unit']").find(input).off("click"); //移除点击事件
														body.find("[field='Unit']").find(input).attr("data-ratio",ratio); //修改比例缓存信息
													}
													else {
														var unitName = res.data[0].unitName;
														if(unitName) {
															ratio = unitName.substring(unitName.indexOf(":")+1).replace(")",""); //给比例赋值
															unitName = unitName.substring(0, unitName.indexOf("("));
														}
														var unitArr = unitName.split(",");
														var basicUnit = unitArr[0]; //基础单位
														var otherUnit = unitArr[1]; //副单位
														var unitSetInput =""; //单位
														body.find("[field='Unit']").find(input).prop("readonly","readonly"); //设置计量单位为只读
														var loadRatio = 1; //在单位输入框上面加载比例字段
														if(listSubType === "采购" || listSubType === "采购退货" || listSubType === "采购订单"){
															unitSetInput = res.data[0].firstinunit; //给单位文本框赋值
															if(basicUnit==unitSetInput){ //基础单位等于选择的单位
																loadRatio = 1;
															}
															else if(otherUnit==unitSetInput){ //副单位等于选择的单位
																loadRatio = ratio;
															}
														}
														else if(listSubType === "销售" || listSubType === "销售退货" || listSubType === "销售订单" || listSubType === "零售" || listSubType === "零售退货"){
															unitSetInput = res.data[0].firstoutunit; //给单位文本框赋值
															if(basicUnit==unitSetInput){ //基础单位等于选择的单位
																loadRatio = 1;
															}
															else if(otherUnit==unitSetInput){ //副单位等于选择的单位
																loadRatio = ratio;
															}
														}
														body.find("[field='Unit']").find(input).val(unitSetInput).attr("data-ratio", loadRatio); //设置-首选单位

														body.find("[field='Unit']").find(input).off("click").on("click",function(){
															if(basicUnit && otherUnit) {
																var self = this;
																//定义模版
																var temp = "<div class='unit-list'>";
																temp +="<ul>";
																temp +="<li data-type='basic' data-ratio='1'>" + basicUnit + "</li>";
																temp +="<li data-type='other' data-ratio='" + ratio + "'>" + otherUnit + "</li>";
																temp +="</ul>";
																temp +="</div>";
																if($('.unit-list').length){
																	$('.unit-list').remove(); //如果存在计量单位列表先移除
																}
																else {
																	$(self).after(temp); //加载列表信息
																}
																//计量单位列表的单击事件
																$('.unit-list ul li').off("click").on("click",function(){
																	var unit = $(this).text();
																	var thisRatio = $(this).attr("data-ratio"); //获取比例
																	$(self).val(unit).attr("data-ratio", thisRatio);
																	$(self).keyup(); //模拟键盘操作
																	$('.unit-list').remove(); //移除计量单位列表
																	var stock = body.find("[field='Stock']").find(input).attr("data-stock"); //从缓存中取值
																	var type = $(this).attr("data-type");
																	var UnitPrice = 0;
																	if(type === "basic"){
																		if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "销售退货列表" || listTitle == "其它入库列表") {
																			UnitPrice = basicPresetPriceOne;
																		}
																		else if(listTitle == "销售订单列表" || listTitle == "销售出库列表" || listTitle == "采购退货列表" || listTitle == "其它出库列表" || listTitle == "调拨出库列表") {
																			UnitPrice = basicPresetPriceTwo;
																		}
																		else if(listTitle == "零售出库列表" || listTitle == "零售退货列表"){
																			UnitPrice = retailPriceOne;
																		}
																		body.find("[field='Stock']").find(input).val(stock); //修改库存
																	}
																	else if(type === "other"){
																		if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "销售退货列表" || listTitle == "其它入库列表") {
																			UnitPrice = otherPresetPriceOne;
																		}
																		else if(listTitle == "销售订单列表" || listTitle == "销售出库列表" || listTitle == "采购退货列表" || listTitle == "其它出库列表" || listTitle == "调拨出库列表") {
																			UnitPrice = otherPresetPriceTwo;
																		}
																		else if(listTitle == "零售出库列表" || listTitle == "零售退货列表"){
																			UnitPrice = retailPriceTwo;
																		}
																		// body.find("[field='Stock']").find(input).val((stock/ratio).toFixed(2)); //修改库存
																		body.find("[field='Stock']").find(input).val(stock);
																	}
																	body.find("[field='UnitPrice']").find(input).val(UnitPrice); //单价
																	var OperNumber = body.find("[field='OperNumber']").find(input).val(); //获取数量
																	var taxRate = body.find("[field='TaxRate']").find(input).val(); //获取税率
																	body.find("[field='TaxUnitPrice']").find(input).val((UnitPrice*(1+taxRate/100)).toFixed(2)); //含税单价
																	body.find("[field='AllPrice']").find(input).val((UnitPrice*OperNumber).toFixed(2)); //金额
																	body.find("[field='TaxMoney']").find(input).val((UnitPrice*OperNumber*(taxRate/100)).toFixed(2)); //税额
																	body.find("[field='TaxLastMoney']").find(input).val((UnitPrice*OperNumber*(1+taxRate/100)).toFixed(2)); //价税合计
																	statisticsFun(body,UnitPrice,OperNumber,footer,taxRate);
																});
																//点击空白处移除计量单位列表
																$(".datagrid-body").off("click").on("click",function(){
																	$('.unit-list').remove(); //移除计量单位列表
																});
															}
														});
													}
													var detailPrice = 0; //明细列表-单价
													if(listSubType == "零售" || listSubType == "零售退货") {
														if(res.data[0].unit) { //如果存在计量单位信息
															detailPrice = retailPrice;
														}
														else {
															if (firstOutUnit == basicUnit) {
																detailPrice = retailPriceOne;
															}
															else if (firstOutUnit == otherUnit) {
																detailPrice = retailPriceTwo;
															}
														}
													}
													else if(listTitle == "采购订单列表" || listTitle == "采购入库列表" || listTitle == "销售退货列表" || listTitle == "其它入库列表") {
														if(res.data[0].unit) { //如果存在计量单位信息
															detailPrice = presetPriceOne;
														}
														else {
															if (firstInUnit == basicUnit) {
																detailPrice = basicPresetPriceOne;
															}
															else if (firstInUnit == otherUnit) {
																detailPrice = otherPresetPriceOne;
															}
														}
													}
													else if(listTitle == "销售订单列表" || listTitle == "销售出库列表" || listTitle == "采购退货列表" || listTitle == "其它出库列表" || listTitle == "调拨出库列表") {
														if(res.data[0].unit) { //如果存在计量单位信息
															detailPrice = presetPriceTwo;
														}
														else {
															if(firstOutUnit==basicUnit) {
																detailPrice = basicPresetPriceTwo;
															}
															else if(firstOutUnit==otherUnit){
																detailPrice = otherPresetPriceTwo;
															}
														}
													}
													body.find("[field='OperNumber']").find(input).val(1); //数量初始化为1
													//单价和总价赋值
													if(!detailPrice) {
														detailPrice = 0;
													}
													body.find("[field='UnitPrice']").find(input).val(detailPrice);
													body.find("[field='AllPrice']").find(input).val(detailPrice);
													var taxRate = body.find("[field='TaxRate']").find(input).val()-0; //获取税率
													body.find("[field='TaxUnitPrice']").find(input).val((detailPrice*(1+taxRate/100)).toFixed(2));  //含税单价
													body.find("[field='TaxMoney']").find(input).val((detailPrice*(taxRate/100)).toFixed(2));  //税额
													body.find("[field='TaxLastMoney']").find(input).val((detailPrice*(1+taxRate/100)).toFixed(2));  //价税合计
													body.find("[field='conyract_money']").find(input).val((detailPrice*(1+taxRate/100)).toFixed(2));  //合同价格
													if (res.data[0].name == "套餐一（人脸识别考勤机2台、三辊闸机1台）") {
														body.find("[field='machine_number']").find(input).val("2");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "套餐二（人脸识别考勤机2台、三辊闸机2台）"){
														body.find("[field='machine_number']").find(input).val("2");
														body.find("[field='gate_number']").find(input).val("2");
													} else if (res.data[0].name ==  "套餐三（人脸识别考勤机4台、三辊闸机2台）"){
														body.find("[field='machine_number']").find(input).val("4");
														body.find("[field='gate_number']").find(input).val("2");
													} else if (res.data[0].name ==  "套餐四（人脸识别考勤机3台、三辊闸机3台）"){
														body.find("[field='machine_number']").find(input).val("3");
														body.find("[field='gate_number']").find(input).val("3");
													} else if (res.data[0].name ==  "套餐五（人脸识别考勤机6台、三辊闸机3台）"){
														body.find("[field='machine_number']").find(input).val("6");
														body.find("[field='gate_number']").find(input).val("3");
													} else if (res.data[0].name ==  "产品四（三辊闸1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品五（翼闸单机芯1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品六（翼闸双机芯1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品七（全高闸单通道1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品八（全高闸双通道1台）"){
														body.find("[field='machine_number']").find(input).val("0");
														body.find("[field='gate_number']").find(input).val("1");
													} else if (res.data[0].name ==  "产品三（人证信息采集设备1台）"){
														body.find("[field='machine_number']").find(input).val("1");
														body.find("[field='gate_number']").find(input).val("0");
													} else if (res.data[0].name ==  "产品二（固定式人脸识别考勤机1台）"){
														body.find("[field='machine_number']").find(input).val("1");
														body.find("[field='gate_number']").find(input).val("0");
													} else if (res.data[0].name ==  "产品一（移动式人脸识别考勤平板1台）"){
														body.find("[field='machine_number']").find(input).val("1");
														body.find("[field='gate_number']").find(input).val("0");
													}
													statisticsFun(body,detailPrice,1,footer,taxRate);

													//查询库存信息
													var depotId = body.find("[field='DepotId']").find(".combo-value").val();
													if(depotId) {
														var type = "select"; //type 类型：点击 click，选择 select
														findStockNumById(depotId, mId, monthTime, body, input, loadRatio, type);
													}
												}
											},
											error: function() {
												$.messager.alert('页面加载提示','页面加载异常，请稍后再试！','error');
											}
										});
									}
								}
							}
						}
					},
					{ title: '库存',field: 'Stock',editor:'validatebox',width:70},
					{ title: anotherDepotHeadName, field: 'AnotherDepotId',editor:'validatebox',hidden:isShowAnotherDepot,width:90,
						formatter: function (value, row, index) {
							return row.AnotherDepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: anotherDepotTextField,
								method: 'get',
								url: anotherDepotUrl,
								readonly : true,
							}
						}
					},
					{ title: '单位',field: 'Unit',editor:'validatebox',width:60},
					{ title: '数量',field: 'OperNumber',editor:'validatebox',width:60},
					{ title: '单价',field: 'UnitPrice',editor:'validatebox',width:60},
					{ title: '含税单价',field: 'TaxUnitPrice',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '金额',field: 'AllPrice',editor:'validatebox',width:90},
					{ title: '税率(%)',field: 'TaxRate',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '税额',field: 'TaxMoney',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '价税合计',field: 'TaxLastMoney',editor:'validatebox',hidden:isShowTaxColumn,width:78},
					{ title: '发货',field: 'gate',editor:'validatebox',width:78,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: '/depot/findDepot',
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '安装',field: 'install',editor:'validatebox',width:78,
						formatter: function (value, row, index) {
							return row.DepotName;
						},
						editor: {
							type: 'combobox',
							options: {
								valueField: 'id',
								textField: depotTextField,
								method: 'get',
								url: '/depot/findDepot',
								onSelect:function(rec){
									var depotId = rec.id;
									body =$("#depotHeadFM .datagrid-body");
									footer =$("#depotHeadFM .datagrid-footer");
									input = ".datagrid-editable-input";
									var mId = body.find("[field='MaterialId']").find(".combo-value").val();
									if(mId){
										var type = "select"; //type 类型：点击 click，选择 select
										findStockNumById(depotId, mId, monthTime, body, input, ratioDepot, type);
									}
								}
							}
						}
					},
					{ title: '人脸机类型',field: 'machine_type',editor:'validatebox',width:78},
					{ title: '人脸机数量',field: 'machine_number',editor:'validatebox',width:78},
					{ title: '闸机类型',field: 'gate_type',editor:'validatebox' ,width:78},
					{ title: '闸机数量',field: 'gate_number',editor:'validatebox',width:78},
					{ title: '品名-别',field: 'OtherField1',editor:'validatebox',hidden:otherColumns,width:60},
					{ title: '型号-别',field: 'OtherField2',editor:'validatebox',hidden:otherColumns,width:60},
					{ title: '颜色-别',field: 'OtherField3',editor:'validatebox',hidden:otherColumns,width:60},
					{ title: '备注1',field: 'OtherField4',editor:'validatebox',hidden:true,width:60},
					{ title: '备注2',field: 'OtherField5',editor:'validatebox',hidden:true,width:60}
				]],
				toolbar:[
					{
						id:'append',
						text:'新增行',
						iconCls:'icon-add',
						handler:function() {
							append(); //新增行
						}
					},
					{
						id:'delete',
						text:'删除行',
						iconCls:'icon-remove',
						handler:function() {
							batchDel(); //删除行
						}
					},
					{
						id:'reject',
						text:'撤销',
						iconCls:'icon-undo',
						handler:function() {
							reject(); //撤销
						}
					}
				],
				onLoadError:function()
				{
					$.messager.alert('页面加载提示','页面加载异常，请稍后再试！','error');
					return;
				}
			});
		}
	}

	$.ajax({
		type:"get",
		url: '/depotItem/getDetailList',
		data: {
			headerId: depotHeadID,
			mpList: mPropertyList
		},
		dataType: "json",
		success: function (res) {
			if(res && res.code === 200) {
				var data = res.data;
				var AllPrice = 0;
				var TaxLastMoney = 0;
				var DiscountMoney = $("#DiscountMoney").val()-0; //优惠金额
				var DiscountLastMoney = $("#DiscountLastMoney").val()-0; //优惠后金额
				if(type === "edit") {
					AllPrice = TotalPrice;
					TaxLastMoney = DiscountMoney + DiscountLastMoney;
				}
				var array = [];
				array.push({
					"AllPrice": AllPrice,
					"TaxLastMoney": TaxLastMoney
				});
				data.footer = array;
				$("#materialData").datagrid('loadData',data);
				//如果是订单跳转到采购或销售
				if(pageType === "skip") {
					var skipList = $("#depotHeadFM .datagrid-body tr");
					var input = ".datagrid-editable-input";
					//逐条自动点击每行数据
					skipList.each(function (i) {
						setTimeout(function () {
							skipList.eq(i).find("[field='Remark']").click().find(input).val("来自订单"); //此处为确保订单转销售成功，勿删
						},(i+1)*200);
					});
				}
			}
		},
		error:function() {
			$.messager.alert('查询提示','查询数据后台异常，请稍后再试！','error');
		}
	});
}
//初始化表格数据-商品列表-查看状态
function initTableData_material_show(TotalPrice){
	var isShowAnotherDepot = true; //显示对方仓库,true为隐藏,false为显示
	var anotherDepotHeadName = ""; //对方仓库的列的标题
	var depotHeadName = ""; //仓库的列的标题
	if(listSubType == "调拨"){
		isShowAnotherDepot = false; //调拨时候显示对方仓库
		anotherDepotHeadName = "调入仓库";
	}
	depotHeadName = "仓库名称";
	var isShowTaxColumn = false; //是否显示税率相关的列,true为隐藏,false为显示
	if(listSubType == "调拨" || listSubType == "其它" || listSubType == "零售" || listSubType == "零售退货" || listSubType == "采购订单" || listSubType == "销售订单" || listSubType == "组装单" || listSubType == "拆卸单"){
		isShowTaxColumn = true; //隐藏
	}
	var isShowMaterialTypeColumn = true; //是否显示商品类型相关的列,true为隐藏,false为显示
	if(listSubType == "组装单" || listSubType == "拆卸单"){
		isShowMaterialTypeColumn = false; //显示
	}
	var isShowFinishColumn = true; //是否显示分批数量的列,true为隐藏,false为显示
	if(listSubType == "销售订单"){
		isShowFinishColumn = false; //显示
	}
	$('#materialDataShow').datagrid({
		height:245,
		rownumbers: true,
		//动画效果
		animate:false,
		//选中单行
		singleSelect : true,
		collapsible:false,
		selectOnCheck:false,
		pagination: false,
		//交替出现背景
		striped : true,
		showFooter: true,
		onClickRow: onClickRow,
		columns:[[
			{ title: '商品类型',field: 'MType',width:80, hidden:isShowMaterialTypeColumn},
			{ title: depotHeadName,field: 'DepotName',editor:'validatebox',width:90},
			{ title: '订单类型',field: 'order_type',width:78},
			{ title: '品名(型号)(扩展信息)(单位)',field: 'MaterialName',width:230},
			{ title: '库存',field: 'Stock',width:70},
			{ title: anotherDepotHeadName,field: 'AnotherDepotName',hidden:isShowAnotherDepot,width:90},
			{ title: '单位',field: 'Unit',editor:'validatebox',width:60},
			{ title: '数量',field: 'OperNumber',editor:'validatebox',width:60},
			// { title: '分批数量',field: 'finishNumber',editor:'validatebox',hidden:isShowFinishColumn,width:60},
			{ title: '单价',field: 'UnitPrice',editor:'validatebox',width:60},
			{ title: '含税单价',field: 'TaxUnitPrice',editor:'validattebox',hidden:isShowTaxColumn,width:78},
			{ title: '金额',field: 'AllPrice',editor:'validatebox',width:78},
			{ title: '税率',field: 'TaxRate',editor:'validatebox',hidden:isShowTaxColumn,width:78},
			{ title: '税额',field: 'TaxMoney',editor:'validatebox',hidden:isShowTaxColumn,width:78},
			{ title: '价税合计',field: 'TaxLastMoney',editor:'validatebox',hidden:isShowTaxColumn,width:78},
			{ title: '工程名称',field: 'OrganName',editor:'validatebox',width:78},
			{ title: '姓名',field: 'contacts',editor:'validatebox',width:78},
			{ title: '电话',field: 'phonenum',editor:'validatebox',width:78},
			// { title: '联系人微信',field: 'we_chat',editor:'validatebox',width:78},
			// { title: '公司/施工单位名称',field: 'company',editor:'validatebox',width:78},
			{ title: '工程地址',field: 'description',editor:'validatebox',width:78},

			{ title: '合同',field: 'contract',width:78},
			{ title: '合同编号',field: 'conyract_number',width:78},
			// { title: '合同金额',field: 'conyract_money',width:78},
			{ title: '收款',field: 'payment',width:78},
			{ title: '发票',field: 'invoice',width:78},
			{ title: '发货',field: 'gate',width:78},
			{ title: '安装',field: 'install',width:78},
			// { title: '安装人',field: 'installer',width:78},
			// { title: '最晚安装日期',field: 'installer_time',width:78},
			{ title: '人脸机类型',field: 'machine_type',width:78},
			{ title: '人脸机数量',field: 'machine_number',width:78},
            { title: '未发货人脸机数量',field: 'machine_number2',width:78},
			{ title: '闸机类型',field: 'gate_type',width:78},
			{ title: '闸机数量',field: 'gate_number',width:78},
            { title: '未发货闸机数量',field: 'gate_number2',width:78},
			{ title: '备注',field: 'Remark',editor:'validatebox',width:120},
			{ title: '品名-别',field: 'OtherField1',editor:'validatebox',hidden:otherColumns,width:60},
			{ title: '型号-别',field: 'OtherField2',editor:'validatebox',hidden:otherColumns,width:60},
			{ title: '颜色-别',field: 'OtherField3',editor:'validatebox',hidden:otherColumns,width:60},
			{ title: '备注1',field: 'OtherField4',editor:'validatebox',hidden:true,width:60},
			{ title: '备注2',field: 'OtherField5',editor:'validatebox',hidden:true,width:60}
		]],
		onLoadError:function() {
			$.messager.alert('页面加载提示','页面加载异常，请稍后再试！','error');
			return;
		}
	});
	$.ajax({
		type:"get",
		url: '/depotItem/getDetailList',
		data: {
			headerId: depotHeadID,
			mpList: mPropertyList
		},
		dataType: "json",
		success: function (res) {
			if(res && res.code === 200) {
				var data = res.data;
				var AllPrice = TotalPrice;
				var DiscountMoney = $("#DiscountMoneyShow").text() - 0; //优惠金额
				var DiscountLastMoney = $("#DiscountLastMoneyShow").text() - 0; //优惠后金额
				var array = [];
				array.push({
					"AllPrice": AllPrice,
					"TaxLastMoney": DiscountMoney + DiscountLastMoney
				});
				data.footer = array;
				$("#materialDataShow").datagrid('loadData', data);
			}
		},
		error:function() {
			$.messager.alert('查询提示','查询数据后台异常，请稍后再试！','error');
		}
	});
}
//分页信息处理
function ininPager(){
	try {
		var opts = $("#tableData").datagrid('options');
		var pager = $("#tableData").datagrid('getPager');
		pager.pagination({
			onSelectPage:function(pageNum, pageSize) {
				opts.pageNumber = pageNum;
				opts.pageSize = pageSize;
				pager.pagination('refresh', {
					pageNumber:pageNum,
					pageSize:pageSize
				});
				showDepotHeadDetails(pageNum,pageSize);
			}
		});
	}
	catch (e) {
		$.messager.alert('异常处理提示',"分页信息异常 :  " + e.name + ": " + e.message,'error');
	}
}
//删除单据信息
function deleteDepotHead(depotHeadID, thisOrganId, totalPrice, status){
	if(status == "1" || status == "2") {
		$.messager.alert('删除提示','已审核和已转的单据不能删除！','warning');
		return;
	}
	$.messager.confirm('删除确认','确定要删除此单据信息吗？',function(r) {
		if (r) {
			$.ajax({
				type:"post",
				url: "/depotHead/deleteDepotHeadAndDetail",
				dataType: "json",
				data:{
					id: depotHeadID
				},
				success: function (res) {
					if(res && res.code == 200) {
						$("#searchBtn").click();
					} else {
						$.messager.alert('删除提示', '删除单据信息失败，请稍后再试！', 'error');
					}
				},
				//此处添加错误处理
				error:function() {
					$.messager.alert('删除提示','删除单据信息异常，请稍后再试！','error');
					return;
				}
			});

			//更新会员的预收款信息
			if(listSubType === "零售") {
				$.ajax({
					type:"post",
					url: "/supplier/updateAdvanceIn",
					dataType: "json",
					data:{
						supplierId: thisOrganId, //会员id
						advanceIn: totalPrice  //删除时同时返还用户的预付款
					},
					success: function(res){
						if(res && res.code === 200) {
							//保存会员预收款成功
						}
					},
					error: function(){
						$.messager.alert('提示','保存信息异常，请稍后再试！','error');
						return;
					}
				});
			}
		}
	});
}
//订单转采购或销售
function skipDepotHead(index){
	var res = $("#tableData").datagrid("getRows")[index];
	if(status == "0" || status == "2") {
		$.messager.alert('提示','未审核和已转的单据禁止操作！','warning');
	} else {
		sessionStorage.setItem("rowInfo", JSON.stringify(res)); //将单据信息存入缓存中
		if(listTitle == "采购订单列表") {
			js.addTabPage(null, "订单转采购", "/pages/materials/purchase_in_list.html?t=skip");
		} else if(listTitle == "销售订单列表") {
			js.addTabPage(null, "订单转销售", "/pages/materials/sale_out_list.html?t=skip");
		}
	}
}
//批量删除单据信息
function batDeleteDepotHead(){
	var row = $('#tableData').datagrid('getChecked');
    if(row.length == 0) {
        $.messager.alert('删除提示','没有记录被选中！','info');
        return;
    }
	if(row.length > 0) {
		$.messager.confirm('删除确认','确定要删除选中的' + row.length + '条单据信息吗？',function(r) {
			if (r) {
				var ids = "";
				for (var i = 0; i < row.length; i++) {
					if (i == row.length - 1) {
						if (row[i].status == 0) {
							ids += row[i].id;
						}
						break;
					}
					ids += row[i].id + ",";
				}
				if (ids) {
					//批量更新会员的预收款信息
					for (var i = 0; i < row.length; i++) {
						if (listSubType === "零售") {
							$.ajax({
								type: "post",
								url: "/supplier/updateAdvanceIn",
								dataType: "json",
								data: {
									supplierId: row[i].organid, //会员id
									advanceIn: row[i].totalprice  //删除时同时返还用户的预付款
								},
								success: function (res) {
									if (res && res.code === 200) {
										//保存会员预收款成功
									}
								},
								error: function () {
									$.messager.alert('提示', '保存信息异常，请稍后再试！', 'error');
									return;
								}
							});
						}
					}
					//批量删除
					$.ajax({
						type: "post",
						url: "/depotHead/batchDeleteDepotHeadAndDetail",
						dataType: "json",
						async: false,
						data: ({
							ids: ids
						}),
						success: function (res) {
							if (res && res.code === 200) {
								$("#searchBtn").click();
								$(":checkbox").attr("checked", false);
							} else {
								$.messager.alert('删除提示', '删除单据信息失败，请稍后再试！', 'error');
							}
						},
						//此处添加错误处理
						error: function () {
							$.messager.alert('删除提示', '删除单据信息异常，请稍后再试！', 'error');
							return;
						}
					});
				} else {
					$.messager.alert('删除提示','没有能删除的单据！','warning');
				}
			}
		});
	}
}
//批量审核|反审核
function setStatusFun(status) {
	var row = $('#tableData').datagrid('getChecked');
	if(row.length == 0) {
		$.messager.alert('提示','没有记录被选中！','info');
		return;
	}
	if(row.length > 0) {
		$.messager.confirm('确认','确定要操作选中的' + row.length + '条信息吗？',function(r) {
			if (r) {
				var ids = "";
				for(var i = 0;i < row.length; i ++) {
					if(i == row.length-1) {
						if(row[i].status != "4") {
							ids += row[i].id;
						}
						break;
					}
					ids += row[i].id + ",";
				}
				if(ids) {
					$.ajax({
						type:"post",
						url: "/depotHead/batchSetStatus",
						dataType: "json",
						async :  false,
						data: ({
							status: status,
							depotHeadIDs : ids
						}),
						success: function (res) {
							if(res && res.code === 200) {
								$("#searchBtn").click();
								$(":checkbox").attr("checked", false);
							} else if (res && res.code == 300) {
								$.messager.alert('提示', '操作信息失败，请稍后再试！', 'error');
							} else {
								$.messager.alert('提示', '操作信息失败，请稍后再试！', 'error');
							}
						},
						//此处添加错误处理
						error:function() {
							$.messager.alert('提示','操作信息异常，请稍后再试！','error');
							return;
						}
					});
				} else {
					$.messager.alert('提示','没有能操作的单据！','warning');
				}
			}
		});
	}
}
//出库操作
function setStatusGate(status) {
	debugger
	var row = $('#tableData').datagrid('getChecked');
	if (row.length == 0) {
		$.messager.alert('提示', '没有记录被选中！', 'info');
		return;
	}
	if (row.length > 0) {
		for (var i = 0; i < row.length; i++) {
			var ids = "";
			for(var i = 0;i < row.length; i ++) {
				if(i == row.length-1) {
					if(row[i].status == "6" || row[i].status == "2" || row[i].status == "7") {
						ids += row[i].id;
					}
					break;
				}
				ids += row[i].id + ",";
			}
			if(ids) {
				$.ajax({
					type:"post",
					url: "/depotHead/batchSetStatus",
					dataType: "json",
					async :  false,
					data: ({
						status: status,
						depotHeadIDs : ids
					}),
					success: function (res) {
						if(res && res.code === 200) {
							$.ajax({
								type: "get",
								url: '/depotItem/getDetailNumberList',
								data: {
									number: row[i].number,
									mpList: mPropertyList
								},
								dataType: "json",
								success: function (res) {
									if (res && res.code === 200) {
										outEject(res);
									}
								},
								error: function () {
									$.messager.alert('查询提示', '查询数据后台异常，请稍后再试！', 'error');
								}
							})
							$("#searchBtn").click();
							$(":checkbox").attr("checked", false);
						} else if (res && res.code == 300) {
							$.messager.alert('提示', '操作信息失败，请稍后再试！', 'error');
						} else {
							$.messager.alert('提示', '操作信息失败，请稍后再试！', 'error');
						}
					},
					//此处添加错误处理
					error:function() {
						$.messager.alert('提示','操作信息异常，请稍后再试！','error');
						return;
					}
				});
			} else {
				$.messager.alert('提示','没有能操作的单据！','warning');
			}
		}
	}

}
var Machinetype_id = [];
var Gatetype_id = [];
var MHandsPersonId = 0;
var MorganId = 0;
var GHandsPersonId = 0;
var GorganId = 0;
var Salesman = "";
var AllPrice = [];
var bjts = 0;
var xsts = 0;
var str = "";
var bqdiv = "div";
var loop = 0;
var depotIdMg = []; //仓库id
//出库提示弹出框
function outEject(res) {
	str = "";
	Machinetype_id = [];
	Gatetype_id = [];
	MHandsPersonId = 0;
	MorganId = 0;
	GHandsPersonId = 0;
	GorganId = 0;
	Salesman = "";
	AllPrice = [];
	bjts = 0;
	xsts = 0;
	depotIdMg = []; //仓库id
	xsts = 0;
	loop = res.data.length;
	for (i = 0; i < res.data.length;i++) {
		if (res.data[i].machine_number2 == 0 && res.data[i].gate_number2 == 0) {
			bjts++;
			if (bjts == res.data.length) {
				$.messager.alert('温馨提示', '本订单货已全部发完', 'info');
				bjts=0;
			}
		} else if (xsts <= 0) {
			$('#outStockDlg').dialog('open').dialog('setTitle', '<img src="/js/easyui-1.3.5/themes/icons/pencil.png"/>&nbsp;出库详情提示');
			xsts++;
		}
	}
	for (i = 0; i < res.data.length;i++){
		str = str + '<div class="out-content-tmp'+i+'">' +
			'          <p>'+(i+1)+'.你将出库的&nbsp;&nbsp;<span class="product" name="product" id="product">'+  res.data[i].MaterialName + '</span>&nbsp;&nbsp;其中包括：</p >' +
			'          <div id="display1" style="white-space: nowrap;">' +
			'            <span name="outId" id="outId" style="display: none">'+ res.data[i].Id +'</span>' +
			'            <input name="OutNumber" id="OutNumber' + i + '" class="easyui-validatebox" style="width: 150px;display: none"/>' +
			'            <span class="face" name="face" id="face">'+ res.data[i].machine_type +'</span>' +
			'            <input type="text" style="width: 30px" name="facecount" id="facecount" value="'+res.data[i].machine_number2+'"/>' +
			'            <span name="facecount2" id="facecount2" style="display: none">'+res.data[i].machine_number2+'</span>' +
			'            <span class="faceunit" name="faceunit" id="faceunit">'+res.data[i].Unit+'</span>,' +
			'            <span class="gate" name="gate" id="gate">'+res.data[i].gate_type+'</span>' +
			'            <input type="text" style="width: 30px" name="gatecount" id="gatecount" value="'+res.data[i].gate_number2+'"/>' +
			'            <span name="gatecount2" id="gatecount2" style="display: none">'+res.data[i].gate_number2 +'</span>' +
			'            <span class="gateunit" name="gateunit" id="gateunit">'+res.data[i].Unit+'</span>' +
			'            </div></div>';
		MaterialStock[i] = res.data[i].MaterialStock;
		gateStock[i] = res.data[i].gateStock;
		Salesman = res.data[i].Salesman;
		Machinetype_id[i] = res.data[i].Machinetype_id;
		Gatetype_id[i] = res.data[i].Gatetype_id;
		AllPricep = res.data[i].AllPrice;
		depotIdMg = res.data[i].depotId;
	}
	debugger
	$(".out-dlg").html(str);
    buildNumber(); //生成单据编号

}
//保存出库信息
function saveoutStockDlg(){
	debugger
    var faceunits = document.getElementsByName("faceunit");
	var gateunits = document.getElementsByName("gateunit");
	var outIds = document.getElementsByName("outId");
	var faces = document.getElementsByName("face");
	var gates = document.getElementsByName("gate");
	var machine_number2s = document.getElementsByName("facecount");
	var gate_number2s = document.getElementsByName("gatecount");
	var facecount2s = document.getElementsByName("facecount2");
	var gatecount2s = document.getElementsByName("gatecount2");

	for (i = 0; i < loop; i++){
		var  num = 0;
        var faceunit = faceunits[i].innerHTML;
		var gateunit = gateunits[i].innerHTML;
		var outId = outIds[i].innerHTML;
		var face = faces[i].innerHTML;
		var gate = gates[i].innerHTML;
		var machine_number2 = machine_number2s[i].value;//发出的人脸数量
		var gate_number2 =gate_number2s[i].value;	//发出的闸机数量
		var machine_number = facecount2s[i].innerHTML;;//原始的人脸数量
		var gate_number =gatecount2s[i].innerHTML;	//原始的闸机数量
		var thisDateTime = getNowFormatDateTime(); //当前时间
		var ts = "";
		var url1="/depotHead/addDepotHeadAndDetail";
		findTypeId(Machinetype_id[i],1,outId);
		findTypeId(Gatetype_id[i],2,outId);
		listType = "出库";
		listSubType = "销售";

		var infoStr1=JSON.stringify({
			Type: listType,
			SubType: listSubType,
			ProjectId: null,
			AllocationProjectId: "",
			DefaultNumber: $("#OutNumber0").val(),//初始编号
			Number: $("#OutNumber0").val(),
			LinkNumber: null,
			OperTime:thisDateTime,
			OrganId: MorganId,//人脸机供应商id
			HandsPersonId: MHandsPersonId,//人脸采购经手人id
			Salesman: Salesman, //销售人员
			AccountId: "",
			ChangeAmount: AllPrice[i], //付款/收款
			TotalPrice: AllPrice[i], //合计
			PayType: "现付", //现付/预付款
			Remark: "",
			AccountIdList: null, //账户列表-多账户
			AccountMoneyList: "", //账户金额列表-多账户
			Discount:null,//优惠率
			DiscountMoney: null,//优惠金额
			DiscountLastMoney: null,//优惠后的金额
			OtherMoney: null, //采购费用、销售费用
			OtherMoneyList: null, //支出项目列表-涉及费用
			OtherMoneyItem: null, //支出项目金额列表-涉及费用
			AccountDay: null,//结算天数
		});
		var infoStr2=JSON.stringify({
			Type: listType,
			SubType: listSubType,
			ProjectId: null,
			AllocationProjectId: "",
			DefaultNumber: $("#OutNumber0").val(),//初始编号
			Number: $("#OutNumber0").val(),
			LinkNumber: null,
			OperTime:thisDateTime,
			OrganId: GorganId,//闸机供应商id
			HandsPersonId: GHandsPersonId,//闸机采购经手人id
			Salesman: Salesman, //销售人员
			AccountId: "",
			ChangeAmount: AllPrice[i], //付款/收款
			TotalPrice: AllPrice[i], //合计
			PayType: "现付", //现付/预付款
			Remark: "",
			AccountIdList: null, //账户列表-多账户
			AccountMoneyList: "", //账户金额列表-多账户
			Discount:null,//优惠率
			DiscountMoney: null,//优惠金额
			DiscountLastMoney: null,//优惠后的金额
			OtherMoney: null, //采购费用、销售费用
			OtherMoneyList: null, //支出项目列表-涉及费用
			OtherMoneyItem: null, //支出项目金额列表-涉及费用
			AccountDay: null,//结算天数
		});
		var inserted1 = JSON.stringify({
			OperNumber:machine_number2,//人脸机发货数量
			BasicNumber:machine_number2,//人脸机发货数量
			DepotId:depotIdMg[i],
			MaterialId:Machinetype_id[i],//材料id
			machinetype_id:Machinetype_id[i],//材料id
            Unit:faceunit,
            UnitPrice:3838,
            TaxUnitPrice:3838,
            AllPrice:3838,
            Remark:"",
            AnotherDepotId:"",
            TaxRate:"",
            TaxMoney:3838,
            TaxLastMoney:3838,

		});
		var inserted2 = JSON.stringify({
			OperNumber:gate_number2,//闸机发货数量
			BasicNumber:gate_number2,//闸机发货数量
			DepotId:depotIdMg[i],
            gatetype_id:Gatetype_id[i],
			MaterialId:Gatetype_id[i],
            Unit:gateunit,
            UnitPrice:3838,
            TaxUnitPrice:3838,
            AllPrice:3838,
            Remark:"",
            AnotherDepotId:"",
            TaxRate:"",
            TaxMoney:3838,
            TaxLastMoney:3838,

        });
		if (Machinetype_id[i] != null && machine_number2 > 0 && MaterialStock[i] - machine_number2 >= 0) {
			addDepotHeadAndDetails2(url1,infoStr1,1,inserted1,face);
		}else if (MaterialStock[i] - machine_number2 < 0) {
			mqk = mqk+face+"库存不足,";
			num += 1;
		}

		if (Gatetype_id[i] != null && gate_number2 > 0 && gateStock[i] - gate_number2 >= 0){
			addDepotHeadAndDetails2(url1,infoStr2,2,inserted2,gate);
		}else if (gateStock[i] - gate_number2 < 0) {
			gqk =gqk+gate+"库存不足"
			num += 1;
		}
		if (num <= 1){
			updateNumber2(machine_number2,gate_number2,machine_number,gate_number,outIds[i].innerHTML);
		}
	}
	$.messager.alert('提示', ''+mqk+''+gqk, 'info');
	$('#outStockDlg').dialog('close');
}
//查询供应商id和经手人id
function findTypeId(mId,pd,tId) {
	debugger
	if (pd == 1){
		$.ajax({
			type: "get",
			url: '/depotItem/findMachineTypeId',
			data: {
				tId:tId,
				mId:mId
			},
			dataType: "json",
			success: function (res) {
				if (res && res.code === 200) {
					MHandsPersonId = res.data.HandsPersonId;
					MorganId = res.data.organId;
				}
			},
			error: function () {
				$.messager.alert('查询提示', '修改数据后台异常，请稍后再试！', 'error');
			}
		})
	} else if (pd == 2) {
		$.ajax({
			type: "get",
			url: '/depotItem/findGateTypeId',
			data: {
				tId:tId,
				mId:mId
			},
			dataType: "json",
			success: function (res) {
				if (res && res.code === 200) {
					GHandsPersonId = res.data.HandsPersonId;
					GorganId = res.data.organId;
				}
			},
			error: function () {
				$.messager.alert('查询提示', '修改数据后台异常，请稍后再试！', 'error');
			}
		})
	}
}
//修改未发货数量
function updateNumber2(machine_number2,gate_number2,machine_number,gate_number,Id) {
	debugger
	var gnumber = 0;
	var mnumber = 0;
	gnumber = gate_number - gate_number2;
	mnumber = machine_number - machine_number2;
	if (gnumber < 0) {
		gnumber = 0;
	}
	if (mnumber < 0) {
		mnumber = 0;
	}
	$.ajax({
		type: "get",
		url: '/depotItem/updateDepotNumber',
		data: {
			gate_numberjs2:gnumber,
			machine_numberjs2:mnumber,
			Id:Id
		},
		dataType: "json",
		success: function (res) {
			if (res && res.code == 200) {
				reduceNumber = 1;
			}
		},
		error: function () {
			$.messager.alert('查询提示', '修改数据后台异常，请稍后再试！', 'error');
		}
	})
}
function setStatusStatus(status) {
	var row = $('#tableData').datagrid('getChecked');
	if(row.length == 0) {
		$.messager.alert('提示','没有记录被选中！','info');
		return;
	}
	if(row.length > 0) {
		$.messager.confirm('确认','确定要操作选中的' + row.length + '条信息吗？',function(r) {
			if (r) {
				var ids = "";
				for(var i = 0;i < row.length; i ++) {
					if(i == row.length-1) {
						if(row[i].status != "4") {
							ids += row[i].id;
						}
						break;
					}
					ids += row[i].id + ",";
				}
				if(ids) {
					$.ajax({
						type:"post",
						url: "/depotHead/batchSetStatus",
						dataType: "json",
						async :  false,
						success: function (res) {
							if(res && res.code === 200) {
								$("#searchBtn").click();
								$(":checkbox").attr("checked", false);
							} else if (res && res.code == 300) {
								$.messager.alert('提示', '操作信息失败，请稍后再试！', 'error');
							} else {
								$.messager.alert('提示', '操作信息失败，请稍后再试！', 'error');
							}
						},
						//此处添加错误处理
						error:function() {
							$.messager.alert('提示','操作信息异常，请稍后再试！','error');
							return;
						}
					});
				} else {
					$.messager.alert('提示','没有能操作的单据！','warning');
				}
			}
		});
	}
}
function setStatusFunMPI(status) {
	var row = $('#tableData').datagrid('getChecked');
	if(row.length == 0) {
		$.messager.alert('提示','没有记录被选中！','info');
		return;
	}
	if(row.length > 0) {
		var ids = "";
		for(var i = 0;i < row.length; i ++) {
			if(i == row.length-1) {
				if(row[i].status != "4") {
					ids += row[i].id;
				}
				break;
			}
			ids += row[i].id + ",";
		}
		if(ids) {
			$.ajax({
				type:"post",
				url: "/depotHead/batchSetStatus",
				dataType: "json",
				async :  false,
				data: ({
					status: status,
					depotHeadIDs : ids
				}),
				success: function (res) {
					if(res && res.code === 200) {
						$("#searchBtn").click();
						$(":checkbox").attr("checked", false);
					} else if (res && res.code == 300) {
						$.messager.alert('提示', '操作信息失败，请稍后再试！', 'error');
					} else {
						$.messager.alert('提示', '操作信息失败，请稍后再试！', 'error');
					}
				},
				//此处添加错误处理
				error:function() {
					$.messager.alert('提示','操作信息异常，请稍后再试！','error');
					return;
				}
			});
		}
	}
}
//导出所有订单信息
function exportDepotItem() {
	//要导出的json数据
	window.location.href="/depotItem/exportDepotItemExcel";
}
function exportDepotItemMExcel() {
    var row = $('#tableData').datagrid('getChecked');
    if(row.length == 0) {
        $.messager.alert('导出提示','没有记录被选中！','info');
        return;
    }
    if(row.length > 0) {
        $.messager.confirm('导出确认','确定要导出选中的' + row.length + '条单据信息吗？',function(r) {
            debugger
            if (r) {
                var ids = "";
                for (var i = 0; i < row.length; i++) {
                    if (i == row.length) {
                        if (row[i].status == 0) {
                            ids += row[i].id;
                        }
                        break;
                    }
                    ids += row[i].id + ",";
                }
                if (ids) {
					// $.ajax({
					// 	type:"GET",
					// 	url: "/depotHead/exportDepotItemMSExcel",
					// 	dataType: "json",
					// 	contentType:"application/x-www-form-urlencoded",
					// 	async :  false,
					// 	data: ({
					// 		ids : ids
					// 	}),
					// });
					//要导出的json数据
					var url = "/depotHead/exportDepotItemMSExcel?ids="+ ids
					debugger
					window.location.href = url
                }
            }
        });
    }
}
function exportDepotItemMSGExcel() {
	var row = $('#tableData').datagrid('getChecked');
	if(row.length == 0) {
		$.messager.alert('导出提示','没有记录被选中！','info');
		return;
	}
	if(row.length > 0) {
		$.messager.confirm('导出确认','确定要导出选中的' + row.length + '条单据信息吗？',function(r) {
			debugger
			if (r) {
				var ids = "";
				for (var i = 0; i < row.length; i++) {
					if (i == row.length) {
						if (row[i].status == 0) {
							ids += row[i].id;
						}
						break;
					}
					ids += row[i].id + ",";
				}
				if (ids) {
					// $.ajax({
					// 	type:"GET",
					// 	url: "/depotHead/exportDepotItemMSExcel",
					// 	dataType: "json",
					// 	contentType:"application/x-www-form-urlencoded",
					// 	async :  false,
					// 	data: ({
					// 		ids : ids
					// 	}),
					// });
					//要导出的json数据
					var url = "/depotHead/exportDepotItemMSExcelBaoDin?ids="+ ids
					window.location.href = url
				}
			}
		});
	}
}
function exportDepotItemFinanceExcel() {
	var row = $('#tableData').datagrid('getChecked');
	if(row.length == 0) {
		$.messager.alert('导出提示','没有记录被选中！','info');
		return;
	}
	if(row.length > 0) {
		$.messager.confirm('导出确认','确定要导出选中的' + row.length + '条单据信息吗？',function(r) {
			debugger
			if (r) {
				var ids = "";
				for (var i = 0; i < row.length; i++) {
					if (i == row.length) {
						if (row[i].status == 0) {
							ids += row[i].id;
						}
						break;
					}
					ids += row[i].id + ",";
				}
				if (ids) {
					// $.ajax({
					// 	type:"GET",
					// 	url: "/depotHead/exportDepotItemMSExcel",
					// 	dataType: "json",
					// 	contentType:"application/x-www-form-urlencoded",
					// 	async :  false,
					// 	data: ({
					// 		ids : ids
					// 	}),
					// });
					//要导出的json数据
					var url = "/depotHead/exportDepotItemFinanceExcel?ids="+ ids
					window.location.href = url
				}
			}
		});
	}
}
//导出所有合同附件
function exportMSG() {
	//要导出的json数据
	window.location.href = "/msg/downloadMsgkk";
}
//导出单个订单合同附件
function exportMSGDAN(index,res) {
	//要导出的json数据
	if(!res) {
		res = $("#tableData").datagrid("getRows")[index];
	}
	var ids = res.id;
	window.location.href = "/msg/downloadMsg?id="+ids;
}
//生成单据编号
function buildNumber() {
	debugger
	$.ajax({
		type: "get",
		url: "/depotHead/buildNumber",
		success:function(res){
			if(res && res.code === 200){
				var obj = res.data;
				var defaultNumber = obj.DefaultNumber;
				var newNumber = amountNum + defaultNumber;
				$("#Number").val(newNumber).attr("data-defaultNumber",newNumber);
				$("#OutNumber0").val(newNumber);
			}
		},
		error:function(){
			$.messager.alert('提示','生成单据编号失败！','error');
		}
	});
}
//新增信息
function addDepotHead(){
	$("#fileformsMsg").hide();//隐藏
	$("#fileformsMsg1").hide();//隐藏
	$("#fileformsMsg2").hide();//隐藏
	$("#fileformsMsg3").hide();//隐藏
	$("#conyract_number1").hide();//隐藏
	$("#conyract_number2").hide();//隐藏
	$("#OperTimes1").hide();//隐藏
	$("#OperTimes2").hide();//隐藏
	$("#fapiao1").hide();//隐藏
	$("#fapiao2").hide();//隐藏
	$("#kaipiao1").hide();//隐藏
	$("#kaipiao2").hide();//隐藏
	$("#fileformsBJ1").show();
	$("#fileformsBJ2").show();
	$("#fileformsBJ3").show();
	$("#fileformsBJ4").show();
	$("#fileformsBJ5").show();
	$("#fileformsBJ6").show();
	$('#depotHeadFM').form('clear');
	var thisDateTime = getNowFormatDateTime(); //当前时间
	$("#OperTime").val(thisDateTime);
	$("#OperTimes").val();
	buildNumber(); //生成单据编号
	//初始化优惠率、优惠金额、优惠后金额、本次付|收款、本次欠款 为0
	$("#Discount").val(0);
	$("#DiscountMoney").val(0);
	$("#DiscountLastMoney").val(0);
	$("#ChangeAmount").val(0);
	$("#Debt").val(0);
	$("#AccountId").val(defaultAccountId); //初始化默认的账户Id
	var addTitle = listTitle.replace("列表","信息");
	$('#depotHeadDlg').dialog('open').dialog('setTitle','<img src="/js/easyui-1.3.5/themes/icons/edit_add.png"/>&nbsp;增加' + addTitle);
	$(".window-mask").css({ width: webW ,height: webH});

	orgDepotHead = "";
	depotHeadID = 0;
	initTableData_material("add",null,"1",20); //商品列表
	reject(); //撤销下、刷新商品列表
	function supplierDlgGroup(type) {
		$('#supplierDlgGroup').dialog('open').dialog('setTitle','<img src="/js/easyui-1.3.5/themes/icons/edit_add.png"/>&nbsp;增加' + type + '信息');
		$('#supplierFM').form('clear');
		bindSupplierGroup();

	}
	function supplierDlgCompany(type) {
		$('#supplierDlgCompany').dialog('open').dialog('setTitle','<img src="/js/easyui-1.3.5/themes/icons/edit_add.png"/>&nbsp;增加' + type + '信息');
		$('#supplierFM').form('clear');
		bindSupplierCompany();
	}
	function supplierDlgFun(type) {
		$('#supplierDlg').dialog('open').dialog('setTitle','<img src="/js/easyui-1.3.5/themes/icons/edit_add.png"/>&nbsp;增加' + type + '信息');
		$('#supplierFM').form('clear');
		bindSupplierEvent();
	}
	$("#addOrgan").off("click").on("click",function(){
		supplierDlgFun("供应商");
	});
	$("#addMember").off("click").on("click",function(){
		supplierDlgFun("会员");
	});
	$("#addGroup").off("click").on("click",function(){
		supplierDlgGroup("集团");
	});
	$("#addCompany").off("click").on("click",function(){
		supplierDlgCompany("公司");
	});
	$("#addCustomer").off("click").on("click",function(){
		supplierDlgFun("项目");
	});
	$("#addAccount").off("click").on("click",function(){
		alert("增加结算账户");
	});
	url = '/depotHead/addDepotHeadAndDetail';

	//零售单据修改收款时，自动计算找零
	if(listSubType == "零售" || listSubType == "零售退货") {
		$("#payType").val("现付");
		$("#OrganId").combobox("setValue", orgDefaultId); //自动默认选择非会员
		// 鼠标点下时清空选择项
		$("#OrganId").next().find("input").off("mousedown").on("mousedown",function(){
			$("#OrganId").combobox("setValue", "");
		});
		//当会员卡号长度超过10位后，自动点击下拉框，用于兼容刷卡器
		$("#OrganId").next().find("input").off("keyup").on("keyup",function(){
			var self = this;
			if($(this).val().length === 10){
				setTimeout(function(){
					$(".combo-panel .combobox-item-selected").click();
					//更新付款类型，加载会员的预付款的金额
					for(var i=0; i<orgDefaultList.length; i++){
						var rec = orgDefaultList[i];
						if(rec.supplier == $(self).val()){
							var option = "";
							if(rec.supplier !== "非会员" && rec.advanceIn >0){
								option = '<option value="预付款">预付款(' + rec.advanceIn + ')</option>';
								option += '<option value="现付">现付</option>';
							}
							else {
								option += '<option value="现付">现付</option>';
							}
							$("#payType").empty().append(option);
						}
					}
				},1000);
			}
		});
		var getAmount = $("#depotHeadFM .get-amount");
		var changeAmount = $("#depotHeadFM .change-amount");
		var backAmount = $("#depotHeadFM .back-amount");
		getAmount.val(0); changeAmount.val(0); backAmount.val(0); //时间初始化
		getAmount.off("keyup").on("keyup",function() {
			if(changeAmount.val()){
				backAmount.val((getAmount.val()-changeAmount.val()).toFixed(2));
			}
		});
	}
}
//编辑信息
function editDepotHead(index, res){
	$("#fileformsMsg").show();//显示
	$("#fileformsMsg1").show();//显示
	$("#fileformsMsg2").show();//显示
	$("#fileformsMsg3").show();//显示
    $("#conyract_number1").show();//显示
    $("#conyract_number2").show();//显示
    $("#OperTimes1").show();//显示
    $("#OperTimes2").show();//显示
    $("#fapiao1").show();//显示
    $("#fapiao2").show();//显示
    $("#kaipiao1").show();//显示
    $("#kaipiao2").show();//显示
	$("#fileformsBJ1").hide();
	$("#fileformsBJ2").hide();
	$("#fileformsBJ3").hide();
	$("#fileformsBJ4").hide();
	$("#fileformsBJ5").hide();
	$("#fileformsBJ6").hide();
	if(!res) {
		res = $("#tableData").datagrid("getRows")[index];
		gate = res.gate;//发货
		install = res.install;//安装
		invoice = res.invoice;//发票
		payment = res.payment;//付款
		contract = res.contract;//合同
	}
	var TotalPrice = res.totalprice; //合计金额
	if(pageType === "skip") { //从订单跳转过来
		buildNumber(); //生成单据编号
		var thisDateTime = getNowFormatDateTime(); //当前时间
		$("#OperTime").val(thisDateTime);
		$("#LinkNumber").val(res.number);  //关联订单号
		$("#AccountId").val(defaultAccountId); //初始化默认的账户Id
		$("#DiscountLastMoney").val(TotalPrice); //优惠后金额
		$("#ChangeAmount").val(TotalPrice).attr("data-changeamount", TotalPrice);
	} else {
		$("#Number").val(res.number).attr("data-defaultNumber",res.number);
		$("#OperTime").val(res.opertimeStr);
		$("#OperTimes").val(res.operTimes);
		$("#invoice_number").val(res.invoice_number);
		$("#conyract_number").val(res.conyract_number);
		$("#LinkNumber").val(res.linknumber); //关联订单号
		$("#AccountId").val(res.accountid); //账户Id
		$("#DiscountLastMoney").val(res.discountlastmoney); //优惠后金额
		$("#ChangeAmount").val(res.changeamount).attr("data-changeamount", res.changeamount);
	}
	//$('#OrganId').combobox('setValue', res.organid);
	var tInterval = window.setInterval(function () {
		if ($('#OrganId').combobox().length > 0){
			$('#OrganId').combobox('setValue', res.organid);
			window.clearInterval(tInterval);
		}
	},100);
	$("#HandsPersonId").val(res.handspersonid);
	$("#Remark").val(res.remark);
	$("#Discount").val(res.discount?res.discount:0);
	$("#DiscountMoney").val(res.discountmoney?res.discountmoney:0);
	var discountlastmoney = res.discountlastmoney?res.discountlastmoney:0;
	$("#Debt").val(discountlastmoney-res.changeamount);
	$("#AccountDay").val(res.accountday); //结算天数
	preTotalPrice = res.totalprice; //记录前一次合计金额，用于扣预付款
	$("#AllocationProjectId").val(res.allocationprojectid);
	oldNumber = res.number; //记录编辑前的单据编号
	oldId = res.id; //记录单据Id
	var editTitle = listTitle.replace("列表","信息");
	$('#depotHeadDlg').dialog('open').dialog('setTitle','<img src="/js/easyui-1.3.5/themes/icons/pencil.png"/>&nbsp;编辑' + editTitle);
	$(".window-mask").css({ width: webW ,height: webH});
	depotHeadID = res.id;

	if(listSubType == "零售"){
		var option = "";
		if(depotHeadInfo[17] === "预付款"){
			option = '<option value="预付款">预付款</option>';
			option += '<option value="现付">现付</option>';
		}
		else {
			option += '<option value="现付">现付</option>';
		}
		$("#payType").empty().append(option);
	}

	if(listSubType === "销售" || listSubType === "销售退货" || listSubType === "销售订单"){
		if(res.salesman){
			var arr = res.salesman.split(",");
			var salesmanArray = [];
			for(var i=0;i<arr.length;i++){
				if(arr[i]){
					salesmanArray.push(arr[i].replace("<","").replace(">",""));
				}
			}
			$("#Salesman").combobox('setValues', salesmanArray);
		}
		if (res.conyract_money){
			var arrayList = res.conyract_money.split(",");
			var array = []
			for(var i=0;i<arrayList.length;i++){
				if(arrayList[i]){
					array.push(arrayList[i].replace("<","").replace(">",""));
				}
			}
			$("#conyract_money").combobox('setValues',array);
		}
	}

	//采购入库、销售出库的多账户加载
	if(res.accountidlist && res.accountmoneylist){
		$("#AccountId").val("many"); //下拉框选中多账户
		var accountArr = res.accountidlist.split(",");
		var accountMoneyArr = res.accountmoneylist.split(",");
		accountMoneyArr = changeListFmtPlus(accountMoneyArr)  //将数组单个金额中的数值转为正数

		if(listSubType == "零售" || listSubType == "零售退货") {
			var manyAccountMoney = 0; //多账户合计-零售
			for (var j = 0; j < accountArr.length; j++) {
				if (accountList != null) {
					for (var i = 0; i < accountList.length; i++) {
						var account = accountList[i];
						if (accountArr[j] == account.id) {
							manyAccountMoney += accountMoneyArr[j] - 0; //多账户合计-零售
						}
					}
				}
			}
			$("#getAmount").val(manyAccountMoney); //收款金额、付款金额
			var changeAmount = $("#ChangeAmount").val()-0;
			$("#backAmount").val((manyAccountMoney-changeAmount).toFixed(2)); //找零
		}

		$("#AccountId").attr("data-accountArr", JSON.stringify(accountArr)).attr("data-accountMoneyArr", JSON.stringify(accountMoneyArr));  //json数据存储
		$(".many-account-ico").show(); //显示多账户的ico图标
	}

	//采购入库、销售出库的费用数据加载
	if(res.othermoneylist && res.othermoneyitem){
		$("#OtherMoney").val(res.othermoney); //采购费用、销售费用
		var itemArr = res.othermoneylist.split(",");
		var itemMoneyArr = res.othermoneyitem.split(",");
		$("#OtherMoney").attr("data-itemArr",JSON.stringify(itemArr)).attr("data-itemMoneyArr",itemMoneyArr);  //json数据存储
	}

	if (userdepot == "[10]" || userdepot == "[20]" ) {
		initTableData_material("add",null,2,20); //商品列表
	}else if(userdepot == "[17]"){
		initTableData_material("add",null,2,17); //商品列表
	}else if(userdepot == "[18]"){
		initTableData_material("add",null,2,18); //商品列表
	}else if(userdepot == "[24]"){
		initTableData_material("add",null,2,24); //商品列表
	}
	reject(); //撤销下、刷新商品列表
	if(pageType === "skip") {
		url = '/depotHead/addDepotHeadAndDetail'; //如果是从订单跳转过来，则此处为新增的接口
		//jshjshjsh
		$("#depotHeadFM .datagrid-body").find("[field='DepotId']").click();
	} else {
		url = '/depotHead/updateDepotHeadAndDetail?id=' + res.id; //更新接口
	}
}
function editDepotHeadItemss(index, res){
	if(!res) {
		res = $("#tableData").datagrid("getRows")[index];
	}
	var TotalPrice = res.totalprice; //合计金额
	if(pageType === "skip") { //从订单跳转过来
		buildNumber(); //生成单据编号
		var thisDateTime = getNowFormatDateTime(); //当前时间
		$("#OperTime").val(thisDateTime);
		$("#LinkNumber").val(res.number);  //关联订单号
		$("#AccountId").val(defaultAccountId); //初始化默认的账户Id
		$("#DiscountLastMoney").val(TotalPrice); //优惠后金额
		$("#ChangeAmount").val(TotalPrice).attr("data-changeamount", TotalPrice);
	} else {
		$("#Number").val(res.number).attr("data-defaultNumber",res.number);
		$("#OperTime").val(res.opertimeStr);
		$("#LinkNumber").val(res.linknumber); //关联订单号
		$("#AccountId").val(res.accountid); //账户Id
		$("#DiscountLastMoney").val(res.discountlastmoney); //优惠后金额
		$("#ChangeAmount").val(res.changeamount).attr("data-changeamount", res.changeamount);
	}
	//$('#OrganId').combobox('setValue', res.organid);
	var tInterval = window.setInterval(function () {
		if ($('#OrganId').combobox().length > 0){
			$('#OrganId').combobox('setValue', res.organid);
			window.clearInterval(tInterval);
		}
	},100);
	$("#HandsPersonId").val(res.handspersonid);
	$("#Remark").val(res.remark);
	$("#Discount").val(res.discount?res.discount:0);
	$("#DiscountMoney").val(res.discountmoney?res.discountmoney:0);
	var discountlastmoney = res.discountlastmoney?res.discountlastmoney:0;
	$("#Debt").val(discountlastmoney-res.changeamount);
	$("#AccountDay").val(res.accountday); //结算天数
	preTotalPrice = res.totalprice; //记录前一次合计金额，用于扣预付款
	$("#AllocationProjectId").val(res.allocationprojectid);
	oldNumber = res.number; //记录编辑前的单据编号
	oldId = res.id; //记录单据Id
	var editTitle = listTitle.replace("列表","信息");
	$('#depotHeadItem').dialog('open').dialog('setTitle','<img src="/js/easyui-1.3.5/themes/icons/pencil.png"/>&nbsp;编辑' + editTitle);
	$(".window-mask").css({ width: webW ,height: webH});
	depotHeadID = res.id;

	if(listSubType == "零售"){
		var option = "";
		if(depotHeadInfo[17] === "预付款"){
			option = '<option value="预付款">预付款</option>';
			option += '<option value="现付">现付</option>';
		}
		else {
			option += '<option value="现付">现付</option>';
		}
		$("#payType").empty().append(option);
	}

	if(listSubType === "销售" || listSubType === "销售退货" || listSubType === "销售订单"){
		if(res.salesman){
			var arr = res.salesman.split(",");
			var salesmanArray = [];
			for(var i=0;i<arr.length;i++){
				if(arr[i]){
					salesmanArray.push(arr[i].replace("<","").replace(">",""));
				}
			}
			$("#Salesman").combobox('setValues', salesmanArray);
		}
	}

	//采购入库、销售出库的多账户加载
	if(res.accountidlist && res.accountmoneylist){
		$("#AccountId").val("many"); //下拉框选中多账户
		var accountArr = res.accountidlist.split(",");
		var accountMoneyArr = res.accountmoneylist.split(",");
		accountMoneyArr = changeListFmtPlus(accountMoneyArr)  //将数组单个金额中的数值转为正数

		if(listSubType == "零售" || listSubType == "零售退货") {
			var manyAccountMoney = 0; //多账户合计-零售
			for (var j = 0; j < accountArr.length; j++) {
				if (accountList != null) {
					for (var i = 0; i < accountList.length; i++) {
						var account = accountList[i];
						if (accountArr[j] == account.id) {
							manyAccountMoney += accountMoneyArr[j] - 0; //多账户合计-零售
						}
					}
				}
			}
			$("#getAmount").val(manyAccountMoney); //收款金额、付款金额
			var changeAmount = $("#ChangeAmount").val()-0;
			$("#backAmount").val((manyAccountMoney-changeAmount).toFixed(2)); //找零
		}

		$("#AccountId").attr("data-accountArr", JSON.stringify(accountArr)).attr("data-accountMoneyArr", JSON.stringify(accountMoneyArr));  //json数据存储
		$(".many-account-ico").show(); //显示多账户的ico图标
	}

	//采购入库、销售出库的费用数据加载
	if(res.othermoneylist && res.othermoneyitem){
		$("#OtherMoney").val(res.othermoney); //采购费用、销售费用
		var itemArr = res.othermoneylist.split(",");
		var itemMoneyArr = res.othermoneyitem.split(",");
		$("#OtherMoney").attr("data-itemArr",JSON.stringify(itemArr)).attr("data-itemMoneyArr",itemMoneyArr);  //json数据存储
	}

	if (userdepot == "[10]" || userdepot == "[20]" ) {
		initTableData_material("add",null,2,20); //商品列表
	}else if(userdepot == "[17]"){
		initTableData_material("add",null,2,17); //商品列表
	}else if(userdepot == "[18]"){
		initTableData_material("add",null,2,18); //商品列表
	}else if(userdepot == "[24]"){
		initTableData_material("add",null,2,24); //商品列表
	}
	reject(); //撤销下、刷新商品列表
	if(pageType === "skip") {
		url = '/depotHead/addDepotHeadAndDetail'; //如果是从订单跳转过来，则此处为新增的接口
		//jshjshjsh
		$("#depotHeadFM .datagrid-body").find("[field='DepotId']").click();
	} else {
		url = '/depotHead/updateDepotHeadAndDetail?id=' + res.id; //更新接口
	}
}
//查看信息
function showDepotHead(index){
	var res = $("#tableData").datagrid("getRows")[index];
	var manyAccountMoney = 0; //多账户合计-零售
	$("#ProjectIdShow").text(res.projectName);
	$("#NumberShow").text(res.number);
	$("#OperTimeShow").text(res.opertimeStr);
	$('#OrganIdShow').text(res.organName);
	$("#HandsPersonIdShow").text(res.handsPersonName);
	if(res.accountName){
		$("#AccountIdShow").text(res.accountName); //结算账户
	} else {
		if (res.accountidlist) {
			var accountArr = res.accountidlist.split(","); //账户id列表
			var accountMoneyArr = res.accountmoneylist.split(","); //账户金额列表
			var accountIdShow = "";
			for (var j = 0; j < accountArr.length; j++) {
				if (accountList != null) {
					for (var i = 0; i < accountList.length; i++) {
						var account = accountList[i];
						if (accountArr[j] == account.id) {
							var currentAccountMoney = accountMoneyArr[j] - 0;
							if (currentAccountMoney < 0) {
								currentAccountMoney = 0 - currentAccountMoney;
							}
							accountIdShow = accountIdShow + account.name + "(" + currentAccountMoney + "元) ";
							manyAccountMoney += accountMoneyArr[j] - 0; //多账户合计-零售
						}
					}
				}
			}
			$("#AccountIdShow").text(accountIdShow);
		}
	}
	$("#ChangeAmountShow").text(res.changeamount);
	$("#RemarkShow").text(res.remark);
	$("#DiscountShow").text(res.discount);
	$("#DiscountMoneyShow").text(res.discountmoney);
	$("#DiscountLastMoneyShow").text(res.discountlastmoney);
	$("#DebtShow").text((res.discountlastmoney-res.changeamount).toFixed(2));
	$("#AccountDayShow").text(res.accountday);  //结算天数
	$("#LinkNumberShow").text(res.linknumber); //关联订单号
	if(res.othermoneylist && res.othermoneyitem){
		var itemArr = res.othermoneylist.split(","); //支出项目id列表
		var itemMoneyArr = null;
		if(res.othermoneyitem!=null) {
			itemMoneyArr = eval ("(" + res.othermoneyitem + ")");  //支出项目金额列表
		}
		var otherMoneyShow = "";
		for(var j =0;j<itemArr.length; j++) {
			if (outItemList != null) {
				for (var i = 0; i < outItemList.length; i++) {
					var money = outItemList[i];
					if(itemArr[j] == money.Id) {
						for(var k =0;k<itemMoneyArr.length; k++) {
							if(itemMoneyArr[k].otherId == money.Id) {
								otherMoneyShow += money.InOutItemName;
								if(itemMoneyArr[k].otherMoney) {
									otherMoneyShow +="(" + itemMoneyArr[k].otherMoney +"元)";
								}
								otherMoneyShow+="，";
							}
						}
					}
				}
			}
		}
		$("#OtherMoneyShow").text(otherMoneyShow +"总计："+ res.othermoney + "元 "); //采购费用、销售费用
	}
	else {
		$("#OtherMoneyShow").text(res.othermoney); //采购费用、销售费用
	}
	$("#payTypeShow").text(res.paytype);
	var TotalPrice = res.totalprice;
	$("#AllocationProjectIdShow").text(res.allocationProjectName);
	var showTitle = listTitle.replace("列表","信息");
	$('#depotHeadDlgShow').dialog('open').dialog('setTitle','<img src="/js/easyui-1.3.5/themes/icons/list.png"/>&nbsp;查看' + showTitle);
	$(".window-mask").css({ width: webW ,height: webH});

	depotHeadID = res.id;
	initTableData_material_show(TotalPrice); //商品列表-查看状态

	//零售单据展示数据
	if(listSubType == "零售" || listSubType == "零售退货"){
		var changeAccount = $("#depotHeadDlgShow .change-amount-show").text() -0;
		if(manyAccountMoney!==0){
			$("#depotHeadDlgShow .get-amount-show").text((manyAccountMoney).toFixed(2));
			$("#depotHeadDlgShow .back-amount-show").text((manyAccountMoney -changeAccount).toFixed(2));
		}
		else {
			$("#depotHeadDlgShow .get-amount-show").text((changeAccount).toFixed(2));
			$("#depotHeadDlgShow .back-amount-show").text(0);
		}
	}
	if(listSubType === "销售" || listSubType === "销售退货" || listSubType === "销售订单"){
		if(res.salesman){
			var arr = res.salesman.split(",");
			var salesmanStr = "";
			for(var i=0;i<arr.length;i++){
				if(arr[i]){
					if(i === arr.length-1){
						salesmanStr += arr[i].replace("<","").replace(">","");
					}
					else {
						salesmanStr += arr[i].replace("<","").replace(">","") + ",";
					}
				}
			}
			$.ajax({
				type: "get",
				url: "/person/getPersonByIds",
				data: {
					personIDs: salesmanStr
				},
				success:function(res){
					if(res && res.code === 200){
						if(res.data) {
							$("#SalesmanShow").text(res.data.names); //销售人员列表
						}
					}
				},
				error:function(){

				}
			});
		}
	}
}
//绑定操作事件
function bindEvent(){
	showDepotHeadDetails(1,initPageSize); //初始化时自动查询
	//搜索处理
	$("#searchBtn").off("click").on("click",function(){
		showDepotHeadDetails(1,initPageSize);
		var opts = $("#tableData").datagrid('options');
		var pager = $("#tableData").datagrid('getPager');
		opts.pageNumber = 1;
		opts.pageSize = initPageSize;
		pager.pagination('refresh',
			{
				pageNumber:1,
				pageSize:initPageSize
			});
	});

	//重置按钮
	$("#searchResetBtn").unbind().bind({
		click:function(){
			$("#searchState").val("");
			$("#searchBeginTime").val("");
			$("#searchEndTime").val("");
			//加载完以后重新初始化
			$("#searchBtn").click();
		}
	});

	//检查单据编号是否存在
	function checkDepotHeadNumber() {
		var thisNumber = $.trim($("#Number").val());
		//表示是否存在 true == 存在 false = 不存在
		var flag = false;
		//开始ajax名称检验，不能重名
		if(thisNumber.length > 0 &&( oldNumber.length ==0 || thisNumber != oldNumber))
		{
			$.ajax({
				type:"get",
				url: "/depotHead/checkIsNumberExist",
				dataType: "json",
				async :  false,
				data: ({
					DepotHeadID : oldId,
					Number : thisNumber
				}),
				success: function (tipInfo)
				{
					flag = tipInfo;
					if(tipInfo)
					{
						$.messager.alert('提示','抱歉，该单据编号已经存在','warning');
						return;
					}
				},
				//此处添加错误处理
				error:function()
				{
					$.messager.alert('提示','检查单据编号是否存在异常，请稍后再试！','error');
					return;
				}
			});
		}
		return flag;
	}
	//保存信息
	$("#saveDepotHead").off("click").on("click",function(){
		if(!$('#depotHeadFM').form('validate')){
			return;
		}
		else {
			//如果初始编号被修改了，就要判断单据编号是否存在
			if($.trim($("#Number").val()) != $('#Number').attr("data-defaultNumber")){
				//调用查询单据编号是否重名的方法
				if(checkDepotHeadNumber()){
					return;
				}
			}
			//输入框提示
			if(listTitle === "采购订单列表"){
				if(!$('#OrganId').combobox('getValue')){
					$.messager.alert('提示','请选择供应商！','warning');
					return;
				}
			}
			else if(listTitle === "采购入库列表"){
				if(!$('#OrganId').combobox('getValue')){
					$.messager.alert('提示','请选择供应商！','warning');
					return;
				}
				if(!$('#AccountId').val()){
					$.messager.alert('提示','请选择结算账户！','warning');
					return;
				}
			}
			else if(listTitle === "零售退货列表"){
				if(!$('#AccountId').val()){
					$.messager.alert('提示','请选择付款账户！','warning');
					return;
				}
				if($("#AccountId").val() == "many" && $("#backAmount").val()-0 >0) {
					$.messager.alert('提示', '选择多账户时的找零金额不能大于0！', 'warning');
					return;
				}
			}
			else if(listTitle === "销售退货列表"){
				if(!$('#OrganId').combobox('getValue')){
					$.messager.alert('提示','请选择退货单位！','warning');
					return;
				}
				if(!$('#AccountId').val()){
					$.messager.alert('提示','请选择付款账户！','warning');
					return;
				}
			}
			else if(listTitle === "其它入库列表"){
				if(!$('#OrganId').combobox('getValue')){
					$.messager.alert('提示','请选择往来单位！','warning');
					return;
				}
			}
			else if(listTitle === "零售出库列表"){
				if(!$('#AccountId').val()){
					$.messager.alert('提示','请选择收款账户！','warning');
					return;
				}
				if($("#backAmount").val()-0 <0){
					$.messager.alert('提示','找零金额不能小于0！','warning');
					return;
				}
				if($("#AccountId").val() == "many" && $("#backAmount").val()-0 >0) {
					$.messager.alert('提示', '选择多账户时的找零金额不能大于0！', 'warning');
					return;
				}

			}
			else if(listTitle === "销售订单列表"){
				if(!$('#OrganId').combobox('getValue')){
					$.messager.alert('提示','请选择购买单位！','warning');
					return;
				}
			}
			else if(listTitle === "销售出库列表"){
				if(!$('#OrganId').combobox('getValue')){
					$.messager.alert('提示','请选择购买单位！','warning');
					return;
				}
				if(!$('#AccountId').val()){
					$.messager.alert('提示','请选择收款账户！','warning');
					return;
				}
			}
			else if(listTitle === "采购退货列表"){
				if(!$('#OrganId').combobox('getValue')){
					$.messager.alert('提示','请选择收货单位！','warning');
					return;
				}
				if(!$('#AccountId').val()){
					$.messager.alert('提示','请选择收款账户！','warning');
					return;
				}
			}
			else if(listTitle === "其它出库列表"){
				if(!$('#OrganId').combobox('getValue')){
					$.messager.alert('提示','请选择往来单位！','warning');
					return;
				}
			}
			else if(listTitle === "调拨出库列表"){

			}
			//进行明细的校验
			if(depotHeadID ==0) {
				//新增模式下
				if (!CheckData("add")) {
					return;
				}
			}
			else {
				//编辑模式下
				if (!CheckData("edit")) {
					return;
				}
			}
			var OrganId = null, ProjectId = null,AllocationProjectId = null;
			var ChangeAmount = $.trim($("#ChangeAmount").val())-0;
			var prices = $("#depotHeadFM .datagrid-footer [field='AllPrice'] div").text();
			var TotalPrice = prices.split('').splice(3, prices.length).join('');
			if($('#OrganId').length){
				OrganId = $('#OrganId').combobox('getValue');
			}
			var accountMoneyList = $("#AccountId").attr("data-accountmoneyarr"); //账户金额列表-多账户
			var accountMoneyArr;
			if(accountMoneyList) {
				accountMoneyList = accountMoneyList.replace("[","").replace("]","").toString();
				var reg=new RegExp("\"","g"); //创建正则RegExp对象
				accountMoneyList = accountMoneyList.replace(reg,""); //替换所有的双引号
				accountMoneyArr = accountMoneyList.split(","); //转为数组
			}
			if(listSubType === "采购订单"||listSubType === "采购"||listSubType === "零售退货"||listSubType === "销售退货"){
				//付款为负数
				ChangeAmount = 0 - ChangeAmount;
				TotalPrice = 0 - TotalPrice;
				if(accountMoneyArr) {
					accountMoneyArr = changeListFmtMinus(accountMoneyArr); //将数组单个金额中的数值转为负数
				}
			}
			//零售时候，可以从会员预付款中扣款
			var thisPayType = "现付";
			if(listSubType === "零售") {
				if($("#payType").val() ==="预付款") {
					thisPayType = "预付款";
				}
			}
			var SalesmanStr = "";
			if(listSubType === "销售" || listSubType === "销售退货" || listSubType === "销售订单"){
				var Salesman = $('#Salesman').combobox('getValues').toString(); //销售人员
				if(Salesman) {
					var SalesmanArray = Salesman.split(",");
					for (var i = 0; i < SalesmanArray.length; i++) {
						if (i === SalesmanArray.length - 1) {
							SalesmanStr += "<" + SalesmanArray[i] + ">";
						}
						else {
							SalesmanStr += "<" + SalesmanArray[i] + ">,";
						}
					}
				}
			}
			var getAccountID = $.trim($("#AccountId").val());
			if($("#AccountId").val() === "many"){ //多账户
				getAccountID = null;
			}
			var infoStr=JSON.stringify({
				Type: listType,
				SubType: listSubType,
				ProjectId: ProjectId,
				AllocationProjectId: AllocationProjectId,
				DefaultNumber: $.trim($("#Number").attr("data-defaultNumber")),//初始编号
				Number: $.trim($("#Number").val()),
				LinkNumber: $.trim($("#LinkNumber").val()),
				OperTime: $("#OperTime").val(),
				conyract_number: $("#conyract_number").val(),
				conyract_money: $('#conyract_money').combobox('getValue'),
				OperTimes: $("#OperTimes").val(),
				OrganId: OrganId,
				HandsPersonId: $.trim($("#HandsPersonId").val()),
				Salesman: SalesmanStr, //销售人员
				AccountId: null,
				ChangeAmount: ChangeAmount, //付款/收款
				TotalPrice: TotalPrice, //合计
				PayType: thisPayType, //现付/预付款
				Remark: $.trim($("#Remark").val()),
				AccountIdList: $("#AccountId").attr("data-accountarr"), //账户列表-多账户
				AccountMoneyList: accountMoneyArr ? JSON.stringify(accountMoneyArr) : "", //账户金额列表-多账户
				Discount: $.trim($("#Discount").val()),
				DiscountMoney: $.trim($("#DiscountMoney").val()),
				DiscountLastMoney: $.trim($("#DiscountLastMoney").val()),
				OtherMoney: $.trim($("#OtherMoney").val()), //采购费用、销售费用
				OtherMoneyList: $("#OtherMoney").attr("data-itemarr"), //支出项目列表-涉及费用
				OtherMoneyItem: $("#OtherMoney").attr("data-itemmoneyarr"), //支出项目金额列表-涉及费用
				AccountDay: $("#AccountDay").val(),//结算天数
				myuploadFile: $("#myuploadFile").val(),
                myuploadFiles: $("#myuploadFiles").val(),
				invoice_number: $("#invoice_number").val(),
				invoice_date:$("#kaipiao").val()
			});
			/**
			 * 零售出库，单独操作
			 * */
			if(url.indexOf("/depotHead/addDepotHeadAndDetail")>=0){
				addDepotHeadAndDetail(url,infoStr);
			} else if(url.indexOf("/depotHead/updateDepotHeadAndDetail")>=0){
				updateDepotHeadAndDetail(url,infoStr,preTotalPrice);
			}
		}
	});

	//打印单据
	$("#printDepotHeadShow").off("click").on("click",function(){
		var tableString = $("#depotHeadDlgShow").html();
		localStorage.setItem("tableString",tableString);
		window.open("../../js/print/print_form.html","location:No;status:No;help:No;dialogWidth:800px;dialogHeight:600px;scroll:auto;");
	});

	//初始化键盘enter事件
	$(document).keydown(function(event){
		//兼容 IE和firefox 事件
		var e = window.event || event;
		var k = e.keyCode||e.which||e.charCode;
		//兼容 IE,firefox 兼容
		var obj = e.srcElement ? e.srcElement : e.target;
		//绑定键盘事件为 id是指定的输入框才可以触发键盘事件 13键盘事件 ---遗留问题 enter键效验 对话框会关闭问题
		if(k == "13"&&(obj.id=="State"||obj.id=="Number"))
		{
			$("#saveDepotHead").click();
		}
		//搜索按钮添加快捷键
		if(k == "13"&&(obj.id=="searchState"||obj.id=="searchNumber"||obj.id=="searchMaterial"))
		{
			$("#searchBtn").click();
		}
	});

	//优惠率输入框事件
	$("#Discount").off("keyup").on("keyup",function(){
		var footer =$("#depotHeadFM .datagrid-footer");
		var totalPrice = footer.find("[field='TaxLastMoney']").find("div").text();
		var discountNum = $(this).val();
		var discountMoney  = (discountNum/100*totalPrice).toFixed(2);
		var discountLastMoney  = (totalPrice - discountMoney).toFixed(2);
		$("#DiscountMoney").val(discountMoney); //优惠金额
		$("#DiscountLastMoney").val(discountLastMoney); //优惠后金额
		if($("#AccountId").val()!=="many"){
			$("#ChangeAmount").val(discountLastMoney); //本次付、收款
		}
		var changeAmountNum = $("#ChangeAmount").val()-0; //本次付款或者收款
		$("#Debt").val((discountLastMoney-changeAmountNum).toFixed(2)); //本次欠款
	});

	//优惠金额输入框事件
	$("#DiscountMoney").off("keyup").on("keyup",function(){
		var footer =$("#depotHeadFM .datagrid-footer");
		var totalPrice = footer.find("[field='TaxLastMoney']").find("div").text();
		var discountMoney = $(this).val();
		var discount  = (discountMoney/totalPrice).toFixed(2)*100;
		var discountLastMoney  = (totalPrice - discountMoney).toFixed(2);
		$("#Discount").val(discount); //优惠金额
		$("#DiscountLastMoney").val(discountLastMoney); //优惠后金额
		if($("#AccountId").val()!=="many"){
			$("#ChangeAmount").val(discountLastMoney); //本次付、收款
		}
		var changeAmountNum = $("#ChangeAmount").val()-0; //本次付款或者收款
		$("#Debt").val((discountLastMoney-changeAmountNum).toFixed(2)); //本次欠款
	});

	//付款、收款输入框事件
	$("#ChangeAmount").off("keyup").on("keyup",function(){
		var discountLastMoney = $("#DiscountLastMoney").val();
		var changeAmount = $(this).val();
		var debtMoney  = (discountLastMoney - changeAmount).toFixed(2);
		$("#Debt").val(debtMoney); //本次欠款
	});

	//多账户结算窗口弹出事件
	function depotHeadAccountDlgFun(){
		$('#depotHeadAccountDlg').dialog('open').dialog('setTitle','<img src="/js/easyui-1.3.5/themes/icons/pencil.png"/>&nbsp;多账户结算');
		$("#depotHeadAccountDlg .account-dlg .account-content-tmp").remove(); //先移除输入栏目
		$("#accountMoneyTotalDlg").text(0); //将合计初始化为0
		for(var i=0; i<6; i++) {
			$("#depotHeadAccountDlg .tabs-tmp .account-content-tmp").attr("data-index",5-i); //添加索引
			var contentTmp = $("#depotHeadAccountDlg .tabs-tmp tbody").html();
			var accountDlgHead = $("#depotHeadAccountDlg .account-head-tmp");
			accountDlgHead.after(contentTmp);
		}

		//获取账户信息
		function accountDlgFun() {
			var options = "";
			if(accountList !=null){
				for(var i = 0 ;i < accountList.length;i++) {
					var account = accountList[i];
					options += '<option value="' + account.id + '" data-currentAmount="' + account.currentAmount + '">' + account.name + '</option>';
				}
				$(".account-id-dlg").empty().append("<option></option>").append(options);
			}
		}
		accountDlgFun(); //获取账户信息
		$("#depotHeadAccountDlg .tabs-tmp").hide(); //隐藏模板

		//账户金额输入框事件-多账户
		$("#depotHeadAccountDlg .account-dlg .account-money-dlg").off("keyup").on("keyup",function(){
			var totalAccoutNum = 0;
			$("#depotHeadAccountDlg .account-dlg .account-content-tmp").each(function(){
				var eachAccountMoney = $(this).find(".account-money-dlg").val()-0;
				totalAccoutNum += eachAccountMoney;
			});
			$("#accountMoneyTotalDlg").text(totalAccoutNum);
		});

		//结算多账户列表的切换事件
		$("#depotHeadAccountDlg .account-dlg .account-id-dlg").off("change").on("change",function(){
			var selectAccount = $(this).children('option:selected').text();
			if(selectAccount === ""){
				var thisMoneyDom = $(this).closest(".account-content-tmp").find(".account-money-dlg");
				var thisMoney = thisMoneyDom.val()-0;
				var accountMoneyTotal = $("#accountMoneyTotalDlg").text() - 0;
				$("#accountMoneyTotalDlg").text(accountMoneyTotal - thisMoney);
				thisMoneyDom.val("");  //账户为空时候，将金额也置为空
			}
		});

		//保存按钮事件
		$("#saveDepotHeadAccountDlg").off("click").on("click", function(){
			//完成多账户的json数据存储
			var accountArr = []; //账户id数组
			var accountMoneyArr = []; //账户金额数组
			var errorIndex = -1;
			$("#depotHeadAccountDlg .account-dlg .account-content-tmp").each(function(){
				var thisAccId = $(this).find(".account-id-dlg").val();
				var thisAccMoney =  $(this).find(".account-money-dlg").val();
				if(!thisAccId && thisAccMoney) {
					errorIndex = $(this).attr("data-index")-0;
					return;
				}
				if(thisAccId && !thisAccMoney) {
					errorIndex = $(this).attr("data-index")-0;
					return;
				}
				if(thisAccId && thisAccMoney) {
					accountArr.push(thisAccId);
					accountMoneyArr.push(thisAccMoney);
				}
			});
			if(errorIndex >-1){
				$.messager.alert('错误提示',"第" + (errorIndex+1) + "行数据存在问题，请修改",'warning');
				return;
			}
			var discountLastMoneyNum =$("#DiscountLastMoney").val()-0; //优惠后金额
			var accountMoneyTotal = $("#accountMoneyTotalDlg").text()-0; //本次付款或者收款
			if(accountMoneyTotal===0){
				$.messager.alert('错误提示',"请填写金额后保存",'warning');
				return;
			}
			if(accountArr.length && accountMoneyArr.length) {
				$("#AccountId").attr("data-accountArr",JSON.stringify(accountArr)).attr("data-accountMoneyArr",JSON.stringify(accountMoneyArr));  //json数据存储
			}
			if(listSubType==="零售" || listSubType==="零售退货") {
				$("#getAmount").val(accountMoneyTotal); //给付款或者收款金额赋值
				var backAmount = $("#getAmount").val() - $("#ChangeAmount").val();
				$("#backAmount").val((backAmount - 0).toFixed(2)); //计算找零金额
			}
			else {
				$("#ChangeAmount").val(accountMoneyTotal); //给付款或者收款金额赋值
			}
			$("#Debt").val((discountLastMoneyNum-accountMoneyTotal).toFixed(2)); //本次欠款
			$("#depotHeadAccountDlg").dialog('close');
		});

		//取消事件
		function cancelFun(){
			if($("#AccountId").attr("data-accountArr")){
				$("#depotHeadAccountDlg").dialog('close');
			}
			else {
				$("#depotHeadAccountDlg").dialog('close');
				$("#AccountId").val("").removeAttr("data-accountArr").removeAttr("data-accountMoneyArr"); //将下拉置空并把缓存参数清空
				if(listSubType==="零售" || listSubType==="零售退货"){
					$("#ChangeAmount").prop("readonly","readonly");
				}
				else {
					$("#ChangeAmount").removeProp("readonly","readonly");
				}
				$(".many-account-ico").hide(); //隐藏多账户小图标
			}
		}
		//多账户-取消按钮
		$("#cancelDepotHeadAccountDlg").off("click").on("click", function(){
			cancelFun();
			bianliang = -1;
		});

		//多账户-右上角的关闭按钮
		$("#depotHeadAccountDlg").prev().find(".panel-tool-close").off("click").on("click", function(){
			cancelFun();
		});
	}
	//点击多账户，弹出输入框
	$("#AccountId").off("change").on("change",function(){
		var selectText = $(this).children('option:selected').text();
		if(selectText === "多账户"){
			$("#ChangeAmount").prop("readonly","readonly");
			depotHeadAccountDlgFun();
			$(".many-account-ico").show(); //显示多账户小图标
		}
		else{
			$(this).removeAttr("data-accountArr").removeAttr("data-accountMoneyArr"); //将下拉置空并把缓存参数清空
			if(listSubType==="零售" || listSubType==="零售退货"){
				$("#ChangeAmount").prop("readonly","readonly");
			}
			else {
				$("#ChangeAmount").removeProp("readonly","readonly");
			}
			$(".many-account-ico").hide(); //隐藏多账户小图标
		}
	});

	//结算账户-多账户小图标-点击事件
	$(".many-account-ico").off("click").on("click",function(){
		depotHeadAccountDlgFun();
		//给弹窗赋值-多账户数据
		var accountArr = $("#AccountId").attr("data-accountArr");
		accountArr = JSON.parse(accountArr);
		var accountMoneyArr = $("#AccountId").attr("data-accountMoneyArr");
		accountMoneyArr = JSON.parse(accountMoneyArr);
		$("#depotHeadAccountDlg .account-dlg .account-content-tmp").each(function(){
			var index = $(this).attr("data-index");
			$(this).find(".account-id-dlg").val(accountArr[index]);
			$(this).find(".account-money-dlg").val(accountMoneyArr[index]);
		});
		if(listSubType==="零售" || listSubType==="零售退货") {
			$("#accountMoneyTotalDlg").text($("#getAmount").val());
		}
		else {
			$("#accountMoneyTotalDlg").text($("#ChangeAmount").val());
		}
	});

	//点击采购费用、销售费用的事件
	$(".other-money-ico").off("click").on("click",function(){
		$('#otherMoneyDlg').dialog('open').dialog('setTitle','<img src="/js/easyui-1.3.5/themes/icons/pencil.png"/>&nbsp;'+ listSubType +'费用');
		$("#otherMoneyDlg .money-dlg .money-content-tmp").remove(); //先移除输入栏目
		$("#otherMoneyTotalDlg").text(0); //将合计初始化为0
		for(var i=0; i<6; i++) {
			$("#otherMoneyDlg .tabs-tmp .money-content-tmp").attr("data-index",5-i); //添加索引
			var contentTmp = $("#otherMoneyDlg .tabs-tmp tbody").html();
			var moneyDlgHead = $("#otherMoneyDlg .money-head-tmp");
			moneyDlgHead.after(contentTmp);
		}

		//获取支出项目信息
		function moneyDlgFun() {
			var options = "";
			if(outItemList !=null){
				for(var i = 0 ;i < outItemList.length;i++) {
					var money = outItemList[i];
					options += '<option value="' + money.Id + '">' + money.InOutItemName + '</option>';
				}
				$(".money-id-dlg").empty().append("<option></option>").append(options);
			}
		}
		moneyDlgFun(); //获取支出项目信息
		$("#otherMoneyDlg .tabs-tmp").hide(); //隐藏模板

		//支出项目的金额输入框事件
		$("#otherMoneyDlg .money-dlg .other-money-dlg").off("keyup").on("keyup",function(){
			var totalMoneyNum = 0;
			$("#otherMoneyDlg .money-dlg .money-content-tmp").each(function(){
				var eachOtherMoney = $(this).find(".other-money-dlg").val()-0;
				totalMoneyNum += eachOtherMoney;
			});
			$("#otherMoneyTotalDlg").text(totalMoneyNum);
		});

		//支出项目列表的切换事件
		$("#otherMoneyDlg .money-dlg .money-id-dlg").off("change").on("change",function(){
			var selectItem = $(this).children('option:selected').text();
			if(selectItem === ""){
				var thisMoneyDom = $(this).closest(".money-content-tmp").find(".other-money-dlg");
				var thisMoney = thisMoneyDom.val()-0;
				var otherMoneyTotal = $("#otherMoneyTotalDlg").text() - 0;
				$("#otherMoneyTotalDlg").text(otherMoneyTotal - thisMoney);
				thisMoneyDom.val("");  //支出项目为空时候，将金额也置为空
			}
		});

		//保存按钮事件
		$("#saveOtherMoneyDlg").off("click").on("click", function(){
			//完成支出项目的json数据存储
			var itemArr = []; //支出项目id数组
			var itemMoneyArr = []; //支出项目金额数组
			var errorIndex = -1;
			$("#otherMoneyDlg .money-dlg .money-content-tmp").each(function(){
				var thisId = $(this).find(".money-id-dlg").val();
				var thisMoney =  $(this).find(".other-money-dlg").val();
				if(!thisId && thisMoney) {
					errorIndex = $(this).attr("data-index")-0;
					return;
				}
				if(thisId && !thisMoney) {
					errorIndex = $(this).attr("data-index")-0;
					return;
				}
				if(thisId && thisMoney) {
					itemArr.push(thisId);
					var itemMoneyObj = {};
					itemMoneyObj.otherId = thisId;
					itemMoneyObj.otherMoney = thisMoney;
					itemMoneyArr.push(itemMoneyObj);
				}
			});
			if(errorIndex >-1){
				$.messager.alert('错误提示',"第" + (errorIndex+1) + "行数据存在问题，请修改",'warning');
				return;
			}
			var otherMoneyTotal = $("#otherMoneyTotalDlg").text()-0; //合计金额
			if(otherMoneyTotal === 0){ //0的时候清空缓存数据
				$("#OtherMoney").removeAttr("data-itemArr").removeAttr("data-itemMoneyArr");
			}
			if(itemArr.length && itemMoneyArr.length) {
				$("#OtherMoney").attr("data-itemArr",JSON.stringify(itemArr)).attr("data-itemMoneyArr",JSON.stringify(itemMoneyArr));  //json数据存储
			}
			$("#OtherMoney").val(otherMoneyTotal); //给采购费用、销售费用赋值
			$("#otherMoneyDlg").dialog('close');
		});

		//取消事件
		function cancelFun(){
			if($("#OtherMoney").attr("data-itemArr")){
				$("#otherMoneyDlg").dialog('close');
			}
			else {
				$("#otherMoneyDlg").dialog('close');
				$("#OtherMoney").val("").removeAttr("data-itemArr").removeAttr("data-itemMoneyArr"); //将下拉置空并把缓存参数清空
			}
		}
		//费用-取消按钮
		$("#cancelOtherMoneyDlg").off("click").on("click", function(){
			cancelFun();
		});

		//费用-右上角的关闭按钮
		$("#otherMoneyDlg").prev().find(".panel-tool-close").off("click").on("click", function(){
			cancelFun();
		});

		//给弹窗赋值-采购费用、销售费用数据
		var itemArr = $("#OtherMoney").attr("data-itemArr");
		itemArr = JSON.parse(itemArr);
		var itemMoneyArr = $("#OtherMoney").attr("data-itemMoneyArr");
		itemMoneyArr = JSON.parse(itemMoneyArr);
		$("#otherMoneyDlg .money-dlg .money-content-tmp").each(function(){
			var index = $(this).attr("data-index");
			$(this).find(".money-id-dlg").val(itemArr[index]);
			if(itemMoneyArr[index]!="undefined"){
				for(var k =0;k<itemMoneyArr.length; k++) {
					if (itemMoneyArr[k].otherId == itemArr[index]) {
						$(this).find(".other-money-dlg").val(itemMoneyArr[k].otherMoney);
					}
				}

			}
		});
		$("#otherMoneyTotalDlg").text($("#OtherMoney").val());
	});

}
//绑定供应商、客户事件
function bindSupplierGroup() {
	if(listTitle === "采购入库列表" || listTitle === "其它入库列表" || listTitle === "采购订单列表"
		|| listTitle === "零售出库列表"|| listTitle === "销售出库列表"|| listTitle === "销售订单列表"){
		var supplierType = "供应商";
		if(listTitle === "零售出库列表"){
			supplierType = "会员";
		}else if(listTitle === "销售出库列表" || listTitle === "销售订单列表"){
			supplierType = "客户";
		}
		//检查单位名称是否存在 ++ 重名无法提示问题需要跟进
		function checkSupplierName() {
			var supplierName = $.trim($("#supplier").val());
			var orgSupplier = "";
			//表示是否存在 true == 存在 false = 不存在
			var flag = false;
			//开始ajax名称检验，不能重名
			if(supplierName.length > 0 &&( orgSupplier.length ==0 || supplierName != orgSupplier))
			{
				$.ajax({
					type:"get",
					url: "/supplier/checkIsNameExist",
					dataType: "json",
					async :  false,
					data: ({
						id : 0,
						name : supplierName
					}),
					success: function (res) {
						if(res && res.code === 200) {
							if(res.data && res.data.status) {
								flag = res.data.status;
								if (flag) {
									$.messager.alert('提示', '单位名称已经存在', 'info');
									return;
								}
							}
						}
					},
					//此处添加错误处理
					error:function() {
						$.messager.alert('提示','检查单位名称是否存在异常，请稍后再试！','error');
						return;
					}
				});
			}
			return flag;
		}

		//保存集团信息
		$("#saveSupplierGroup").off("click").on("click",function() {
			if(validateForm("supplierFMGroup")) {
				return;
			}
			if(checkSupplierName()){
				return;
			}
			var reg = /^([0-9])+$/;
			var phonenum = $.trim($("#phonenum").val());
			if(phonenum.length>0 && !reg.test(phonenum))
			{
				$.messager.alert('提示','电话号码只能是数字','info');
				$("#phonenum").val("").focus();
				return;
			}
			var beginNeedGet = $.trim($("#BeginNeedGet").val());
			var beginNeedPay = $.trim($("#BeginNeedPay").val());
			if(beginNeedGet && beginNeedPay) {
				$.messager.alert('提示','期初应收和期初应付不能同时输入','info');
				return;
			}
			var url = '/supplier/add';
			var supObj = $("#supplierFMGroup").serializeObject();
			supObj.type = supplierType;
			supObj.enabled = 1;
			$.ajax({
				url: url,
				type:"post",
				dataType: "json",
				data:{
					info: JSON.stringify(supObj)
				},
				success: function(res) {
					if (res) {
						$('#supplierDlg').dialog('close');
						initSupplier(); //刷新供应商
						$.messager.alert('提示：','保存成功！');
					} else {
						$.messager.alert('提示：','保存失败！');
					}

				}
			});
			addDepotHead();
		});
	}
}
function bindSupplierCompany() {
	if(listTitle === "采购入库列表" || listTitle === "其它入库列表" || listTitle === "采购订单列表"
		|| listTitle === "零售出库列表"|| listTitle === "销售出库列表"|| listTitle === "销售订单列表"){
		var supplierType = "供应商";
		if(listTitle === "零售出库列表"){
			supplierType = "会员";
		}else if(listTitle === "销售出库列表" || listTitle === "销售订单列表"){
			supplierType = "客户";
		}
		//检查单位名称是否存在 ++ 重名无法提示问题需要跟进
		function checkSupplierName() {
			var supplierName = $.trim($("#supplier").val());
			var orgSupplier = "";
			//表示是否存在 true == 存在 false = 不存在
			var flag = false;
			//开始ajax名称检验，不能重名
			if(supplierName.length > 0 &&( orgSupplier.length ==0 || supplierName != orgSupplier))
			{
				$.ajax({
					type:"get",
					url: "/supplier/checkIsNameExist",
					dataType: "json",
					async :  false,
					data: ({
						id : 0,
						name : supplierName
					}),
					success: function (res) {
						if(res && res.code === 200) {
							if(res.data && res.data.status) {
								flag = res.data.status;
								if (flag) {
									$.messager.alert('提示', '单位名称已经存在', 'info');
									return;
								}
							}
						}
					},
					//此处添加错误处理
					error:function() {
						$.messager.alert('提示','检查单位名称是否存在异常，请稍后再试！','error');
						return;
					}
				});
			}
			return flag;
		}

		//保存公司信息
		$("#saveSupplierCompany").off("click").on("click",function() {
			if(validateForm("supplierFMCompany")) {
				return;
			}
			if(checkSupplierName()){
				return;
			}
			var reg = /^([0-9])+$/;
			debugger
			var contacts = $("#llxr").val();//联系人
			var phonenum = $.trim($("#phonenum").val());//联系人电话
			var taxNum = $.trim($("#taxNum").val());//纳税识别号
			var bankName = $.trim($("#bankName").val());//开户行
			var accountNumber = $("#accountNumber").val();//银行账号
			var telephone = $("#telephone").val();//公司电话
			var address = $("#gsdz").val();//公司地址

			if(address =="") {
				$.messager.alert('提示','公司地址不能为空','info');
				return;
			}
			if(telephone =="") {
				$.messager.alert('提示','公司电话不能为空','info');
				return;
			}
			if(accountNumber =="") {
				$.messager.alert('提示','银行账户不能为空','info');
				return;
			}
			if(bankName =="") {
				$.messager.alert('提示','开户行不能为空','info');
				return;
			}
			if(taxNum =="") {
				$.messager.alert('提示','纳税人识别号不能为空','info');
				return;
			}
			if(contacts =="") {
				$.messager.alert('提示','联系人不能为空','info');
				return;
			}
			if(phonenum =="") {
				$.messager.alert('提示','联系人电话不能为空','info');
				return;
			}
			var url = '/supplier/add';
			var supObj = $("#supplierFMCompany").serializeObject();
			supObj.type = supplierType;
			supObj.enabled = 1;
			supObj.supplier_id = supplier_id;
			supObj.address = address;
			supObj.contacts = contacts;
			$.ajax({
				url: url,
				type:"post",
				dataType: "json",
				data:{
					info: JSON.stringify(supObj)
				},
				success: function(res) {
					if (res) {
						$('#supplierDlg').dialog('close');
						initSupplier(); //刷新供应商
						$.messager.alert('提升：','保存成功！');
					} else {
						$.messager.alert('提升：','保存失败！');
					}
				}
			});

			initSupplier(); //供应商
			addDepotHead();
		});
	}
}
function bindSupplierEvent() {
	if(listTitle === "采购入库列表" || listTitle === "其它入库列表" || listTitle === "采购订单列表"
		|| listTitle === "零售出库列表"|| listTitle === "销售出库列表"|| listTitle === "销售订单列表"){
		var supplierType = "供应商";
		if(listTitle === "零售出库列表"){
			supplierType = "会员";
		}else if(listTitle === "销售出库列表" || listTitle === "销售订单列表"){
			supplierType = "客户";
		}
		//检查单位名称是否存在 ++ 重名无法提示问题需要跟进
		function checkSupplierName() {
			var supplierName = $.trim($("#supplier").val());
			var orgSupplier = "";
			//表示是否存在 true == 存在 false = 不存在
			var flag = false;
			//开始ajax名称检验，不能重名
			if(supplierName.length > 0 &&( orgSupplier.length ==0 || supplierName != orgSupplier))
			{
				$.ajax({
					type:"get",
					url: "/supplier/checkIsNameExist",
					dataType: "json",
					async :  false,
					data: ({
						id : 0,
						name : supplierName
					}),
					success: function (res) {
						if(res && res.code === 200) {
							if(res.data && res.data.status) {
								flag = res.data.status;
								if (flag) {
									$.messager.alert('提示', '单位名称已经存在', 'info');
									return;
								}
							}
						}
					},
					//此处添加错误处理
					error:function() {
						$.messager.alert('提示','检查单位名称是否存在异常，请稍后再试！','error');
						return;
					}
				});
			}
			return flag;
		}

		//保存项目信息
		$("#saveSupplier").off("click").on("click",function() {
			debugger
			if(validateForm("supplierFM")) {
				return;
			}
			if(checkSupplierName()){
				return;
			}
			var reg = /^([0-9])+$/;
			var address = $("#xmdz").val();
			var contacts = $("#lxr").val();
			var phonenum = $("#sjhm").val();
			if(phonenum == ""){
				$.messager.alert('提示','电话号码不能为空','info');
				$("#telephone").val("").focus();
				return;
			}
			if (contacts == ""){
				$.messager.alert('提示','项目联系人不能为空');
				return;
			}
			if(address == ""){
				$.messager.alert('提示','项目地址不能为空');
				return;
			}
			var beginNeedGet = $.trim($("#BeginNeedGet").val());
			var beginNeedPay = $.trim($("#BeginNeedPay").val());
			if(beginNeedGet && beginNeedPay) {
				$.messager.alert('提示','期初应收和期初应付不能同时输入','info');
				return;
			}
			var url = '/supplier/add';
			var supObj = $("#supplierFM").serializeObject();
			supObj.type = supplierType;
			supObj.enabled = 1;
			supObj.supplier_id = supplier_id;
			supObj.address = address;
			supObj.contacts = contacts;
			supObj.phonenum = phonenum;
			$.ajax({
				url: url,
				type:"post",
				dataType: "json",
				data:{
					info: JSON.stringify(supObj)
				},
				success: function(res) {
					if (res) {
						$('#supplierDlg').dialog('close');
						initSupplier(); //刷新供应商
						$.messager.alert('提示：',"保存成功");
					} else {
						$.messager.alert('提示：',"保存失败");
					}
				}
			});

			initSupplier(); //供应商
		});
	}
}
//查询单据列表信息
function showDepotHeadDetails(pageNo,pageSize){
	var materialParam = $.trim($("#searchMaterial").val());
	var beginTime = $.trim($("#searchBeginTime").val());
	var endTime = $.trim($("#searchEndTime").val());
	if(beginTime) {
		beginTime = beginTime + ' 00:00:00';
	}
	if(endTime) {
		endTime = endTime + ' 23:59:59';
	}
	$.ajax({
		type: "get",
		url: "/depotHead/list",
		dataType: "json",
		data: ({
			search: JSON.stringify({
				type: listType,
				subType: listSubType,
				state: $.trim($("#searchState").val()),
				number: $.trim($("#searchNumber").val()),
				beginTime: beginTime,
				endTime: endTime,
				materialParam: materialParam,
				depotIds: depotString
			}),
			currentPage: pageNo,
			pageSize: pageSize
		}),
		success: function (res) {
			if(res && res.code === 200){
				if(res.data && res.data.page) {
					$("#tableData").datagrid('loadData', res.data.page);
				}
			}
		},
		//此处添加错误处理
		error: function () {
			$.messager.alert('查询提示', '查询数据后台异常，请稍后再试！', 'error');
			return;
		}
	});
}
//自动计算事件
function autoReckon() {
	//延时绑定事件
	setTimeout(function(){
		var body =$("#depotHeadFM .datagrid-body");
		var footer =$("#depotHeadFM .datagrid-footer");
		var input = ".datagrid-editable-input";
		//点击商品下拉框，自动加载数量、单价、金额


		body.find("[field='Stock']").find(input).prop("readonly","readonly");
		body.find("[field='UnitPrice']").find(input).prop("readonly","readonly");
		body.find("[field='AllPrice']").find(input).prop("readonly","readonly");
		body.find("[field='machine_number']").find(input).prop("readonly","readonly");
		body.find("[field='gate_type']").find(input).prop("readonly","readonly");
		body.find("[field='gate_number']").find(input).prop("readonly","readonly");
		body.find("[field='Unit']").find(input).prop("readonly","readonly");
		//修改数量，自动计算金额和合计，另外计算含税单价、税额、价税合计
		body.find("[field='OperNumber']").find(input).off("keyup").on("keyup",function(){
			var UnitPrice = body.find("[field='UnitPrice']").find(input).val(); //单价
			var taxRate = body.find("[field='TaxRate']").find(input).val(); //税率
			var OperNumber =$(this).val()-0; //数量
			body.find("[field='AllPrice']").find(input).val((UnitPrice*OperNumber).toFixed(2)); //金额
			body.find("[field='TaxUnitPrice']").find(input).val((UnitPrice*(1+taxRate/100)).toFixed(2)); //含税单价
			body.find("[field='TaxMoney']").find(input).val((UnitPrice*OperNumber*(taxRate/100)).toFixed(2)); //税额
			body.find("[field='TaxLastMoney']").find(input).val((UnitPrice*OperNumber*(1+taxRate/100)).toFixed(2)); //价税合计
			statisticsFun(body,UnitPrice,OperNumber,footer,taxRate);
		});
		//修改单价，自动计算金额和合计
		body.find("[field='UnitPrice']").find(input).off("keyup").on("keyup",function(){
			var UnitPrice =$(this).val()-0; //单价
			var taxRate = body.find("[field='TaxRate']").find(input).val(); //税率
			var OperNumber = body.find("[field='OperNumber']").find(input).val(); //数量
			body.find("[field='AllPrice']").find(input).val((UnitPrice*OperNumber).toFixed(2)); //金额
			body.find("[field='TaxUnitPrice']").find(input).val((UnitPrice*(1+taxRate/100)).toFixed(2)); //含税单价
			body.find("[field='TaxMoney']").find(input).val((UnitPrice*OperNumber*(taxRate/100)).toFixed(2)); //税额
			body.find("[field='TaxLastMoney']").find(input).val((UnitPrice*OperNumber*(1+taxRate/100)).toFixed(2)); //价税合计
			statisticsFun(body,UnitPrice,OperNumber,footer,taxRate);
		});
		//修改含税单价，自动计算单价、金额、税额、价税合计和合计
		body.find("[field='TaxUnitPrice']").find(input).off("keyup").on("keyup",function(){
			var TaxUnitPrice =$(this).val()-0; //含税单价
			var taxRate = body.find("[field='TaxRate']").find(input).val(); //税率
			var UnitPrice = TaxUnitPrice/(1+taxRate/100); //计算单价
			body.find("[field='UnitPrice']").find(input).val((UnitPrice).toFixed(2)); //单价
			var OperNumber = body.find("[field='OperNumber']").find(input).val(); //数量
			body.find("[field='AllPrice']").find(input).val((UnitPrice*OperNumber).toFixed(2)); //金额
			body.find("[field='TaxMoney']").find(input).val((UnitPrice*OperNumber*(taxRate/100)).toFixed(2)); //税额
			body.find("[field='TaxLastMoney']").find(input).val((UnitPrice*OperNumber*(1+taxRate/100)).toFixed(2)); //价税合计
			statisticsFun(body,UnitPrice,OperNumber,footer,taxRate);
		});
		//修改金额，自动计算单价、税额、价税合计和合计
		body.find("[field='AllPrice']").find(input).off("keyup").on("keyup",function(){
			var OperNumber = body.find("[field='OperNumber']").find(input).val(); //数量
			var taxRate = body.find("[field='TaxRate']").find(input).val(); //税率
			var AllPrice =$(this).val()-0; //金额
			var UnitPrice = (AllPrice/OperNumber).toFixed(2);
			body.find("[field='UnitPrice']").find(input).val(UnitPrice); //单价
			body.find("[field='TaxUnitPrice']").find(input).val((UnitPrice*(1+taxRate/100)).toFixed(2)); //含税单价
			body.find("[field='TaxMoney']").find(input).val((UnitPrice*OperNumber*(taxRate/100)).toFixed(2)); //税额
			body.find("[field='TaxLastMoney']").find(input).val((UnitPrice*OperNumber*(1+taxRate/100)).toFixed(2)); //价税合计
			statisticsFun(body,UnitPrice,OperNumber,footer,taxRate);
		});
		//修改税率，自动计算含税单价、税额、价税合计和合计
		body.find("[field='TaxRate']").find(input).off("keyup").on("keyup",function(){
			var taxRate =$(this).val()-0; //税率
			var OperNumber = body.find("[field='OperNumber']").find(input).val(); //数量
			var UnitPrice = body.find("[field='UnitPrice']").find(input).val(); //单价
			body.find("[field='TaxUnitPrice']").find(input).val((UnitPrice*(1+taxRate/100)).toFixed(2)); //含税单价
			body.find("[field='TaxMoney']").find(input).val((UnitPrice*OperNumber*(taxRate/100)).toFixed(2)); //税额
			body.find("[field='TaxLastMoney']").find(input).val((UnitPrice*OperNumber*(1+taxRate/100)).toFixed(2)); //价税合计
			statisticsFun(body,UnitPrice,OperNumber,footer,taxRate);
		});
		//修改税额，自动计算税率、含税单价、价税合计和合计
		body.find("[field='TaxMoney']").find(input).off("keyup").on("keyup",function(){
			var taxMoney =$(this).val()-0; //税额
			var AllPrice = body.find("[field='AllPrice']").find(input).val(); //金额
			var taxRate = taxMoney/AllPrice*100; //税率
			var OperNumber = body.find("[field='OperNumber']").find(input).val(); //数量
			var UnitPrice = body.find("[field='UnitPrice']").find(input).val(); //单价
			body.find("[field='TaxUnitPrice']").find(input).val((UnitPrice*(1+taxRate/100)).toFixed(2)); //含税单价
			body.find("[field='TaxRate']").find(input).val((taxRate).toFixed(2)); //税率
			body.find("[field='TaxLastMoney']").find(input).val((UnitPrice*OperNumber*(1+taxRate/100)).toFixed(2)); //价税合计
			statisticsFun(body,UnitPrice,OperNumber,footer,taxRate);
		});
		//修改价税合计，自动计算税率、含税单价、税额和合计
		body.find("[field='TaxLastMoney']").find(input).off("keyup").on("keyup",function(){
			var taxLastMoney =$(this).val()-0; //价税合计
			var AllPrice = body.find("[field='AllPrice']").find(input).val(); //金额
			var taxRate = (taxLastMoney-AllPrice)/AllPrice*100; //税率
			var OperNumber = body.find("[field='OperNumber']").find(input).val(); //数量
			var UnitPrice = body.find("[field='UnitPrice']").find(input).val(); //单价
			body.find("[field='TaxUnitPrice']").find(input).val((UnitPrice*(1+taxRate/100)).toFixed(2)); //含税单价
			body.find("[field='TaxRate']").find(input).val((taxRate).toFixed(2)); //税率
			body.find("[field='TaxMoney']").find(input).val((UnitPrice*OperNumber*(taxRate/100)).toFixed(2)); //税额
			statisticsFun(body,UnitPrice,OperNumber,footer,taxRate);
		});

		//加载税率
		if(thisTaxRate) {
			body.find("[field='TaxRate']").find(input).val(thisTaxRate);
		}
		else {
			body.find("[field='TaxRate']").find(input).val(0); //默认为0
		}

		//在商品类型加载 组装件、普通子件
		var mType = body.find("[field='MType']");
		var rowListLength = mType.find(input).closest(".datagrid-row").attr("datagrid-row-index");
		var mTypeValue = "组合件";
		if(rowListLength > 0){
			mTypeValue = "普通子件";
		}
		if(listSubType == "组装单" || listSubType == "拆卸单"){
			mType.find(input).val(mTypeValue).prop("readonly","readonly");
		}
	},500);
}
//结束编辑明细
function endEditing() {
	if (editIndex == undefined) { return true }
	if ($('#materialData').datagrid('validateRow', editIndex)) {
		//仓库信息
		var edDepot = $('#materialData').datagrid('getEditor', {index:editIndex,field:'DepotId'});
		var DepotName = $(edDepot.target).combobox('getText');
		$('#materialData').datagrid('getRows')[editIndex]['DepotName'] = DepotName;
		//商品信息
		var edMaterial = $('#materialData').datagrid('getEditor', {index:editIndex,field:'MaterialId'});
		var MaterialName = $(edMaterial.target).combobox('getText');
		$('#materialData').datagrid('getRows')[editIndex]['MaterialName'] = MaterialName;
		$('#materialData').datagrid('endEdit', editIndex);
		editIndex = undefined;
		return true;
	} else {
		return false;
	}
}
//单击明细
function onClickRow(index) {
	if (editIndex != index) {
		if (endEditing()) {
			$('#materialData').datagrid('selectRow', index).datagrid('beginEdit', index);
			editIndex = index;
			autoReckon();
		} else {
			$('#materialData').datagrid('selectRow', editIndex);
		}
	}
}
//新增明细
function append(){
	if (endEditing()) {
		$('#materialData').datagrid('appendRow', {DepotId:defDepotId});
		editIndex = $('#materialData').datagrid('getRows').length - 1;
		$('#materialData').datagrid('selectRow', editIndex).datagrid('beginEdit', editIndex);
		autoReckon();
	}
}
//批量删除明细
function batchDel(){
	/**
	 *	1、删除之前必须先调用endEditing结束编辑
	 *	2、如果只是调用endEditing结束编辑那么正在编辑行的被选中状态会被去掉
	 *	所以要在调用endEditing先获取选中的行
	 */
	var row = $('#materialData').datagrid('getChecked');
	if (endEditing()) {
		if (row.length == 0) {
			$.messager.alert('删除提示', '没有记录被选中！', 'info');
			return;
		}
		if (row.length > 0) {
			$.messager.confirm('删除确认', '确定要删除选中的' + row.length + '条单据信息吗？', function (r) {
				if (r) {
					for (var i = 0; i < row.length; i++) {
						$('#materialData').datagrid('deleteRow', $('#materialData').datagrid("getRowIndex", row[i]));
					}
				}
			});
		}
	}
}
//单行删除明细
function removeit(){
	if (editIndex == undefined) { return }
	$('#materialData').datagrid('cancelEdit', editIndex)
		.datagrid('deleteRow', editIndex);
	editIndex = undefined;
}
//撤销明细
function reject() {
	$('#materialData').datagrid('rejectChanges');
	editIndex = undefined;
}
//新增仓库
function appendDepot() {
	$('#depotDlg').dialog('open').dialog('setTitle', '<img src="/js/easyui-1.3.5/themes/icons/edit_add.png"/>&nbsp;增加仓库信息');
	$(".window-mask").css({width: webW, height: webH});
	$('#depotFM').form('clear');
	$("#depotFM #name").focus();
	$("#selectType").val("principal");
	oldDepot = "";
	depotID = 0;
	url = '/depot/add';
	//检查名称是否存在 ++ 重名无法提示问题需要跟进
	function checkDepotName() {
		var name = $.trim($("#name").val());
		//表示是否存在 true == 存在 false = 不存在
		var flag = false;
		//开始ajax名称检验，不能重名
		if (name.length > 0 && (oldDepot.length == 0 || name != oldDepot)) {
			$.ajax({
				type: "get",
				url: "/depot/checkIsNameExist",
				dataType: "json",
				async: false,
				data: ({
					id: depotID,
					name: name
				}),
				success: function (res) {
					if(res && res.code === 200) {
						if(res.data && res.data.status) {
							flag = res.data.status;
							if (flag) {
								$.messager.alert('提示', '仓库名称已经存在', 'info');
								return;
							}
						}
					}
				},
				//此处添加错误处理
				error: function () {
					$.messager.alert('提示', '检查仓库名称是否存在异常，请稍后再试！', 'error');
					return;
				}
			});
		}
		return flag;
	}
	$("#saveDepot").off("click").on("click", function () {
		var infoObj = $("#depotFM").serializeObject();
		infoObj.type = 0;
		if (checkDepotName()) {
			return;
		}
		$.ajax({
			url: url,
			type: "post",
			dataType: "json",
			data: ({
				info: JSON.stringify(infoObj)
			}),
			success: function(res) {
				if(res && res.code === 200) {
					$('#depotDlg').dialog('close');
				}
			},
			//此处添加错误处理
			error: function () {
				$.messager.alert('提示', '保存仓库信息异常，请稍后再试！', 'error');
				return;
			}
		});
	});
}
//新增商品
function appendMaterial() {
	alert("新增商品");
}
//判断明细
function CheckData(type) {
	append();
	removeit();
	var change = $('#materialData').datagrid('getChanges').length;
	if(type =="add" && !change) {
		$.messager.alert('提示','请输入明细信息！','warning');
		return false;
	}
	var row = $('#materialData').datagrid('getRows');
	if(!row.length){
		$.messager.alert('提示',"请输入明细信息！",'info');
		return false;
	}
	var totalRowNum = "";
	for (var i = 0; i < row.length; i++) {
		if (row[i].DepotId == "" || row[i].MaterialId == "" || row[i].OperNumber == "" || row[i].UnitPrice === "" || row[i].AllPrice === "") {
			totalRowNum += (i + 1) + "、";
		}
	}
	if (totalRowNum != "") {
		var totalRowNum = totalRowNum.substring(0, totalRowNum.length - 1);
		$.messager.alert('提示',"第" + totalRowNum + "行数据填写不完整！",'info');
		return false;
	}
	return true;
}
//新增单据主表及单据子表
function addDepotHeadAndDetail(url,infoStr){
	var inserted = null;

	if(pageType === "skip") {
		inserted = $("#materialData").datagrid('getChanges', "updated");
		var update=$("#materialData").datagrid('getChanges', "inserted");
		inserted=inserted.concat(update);
	} else {
		inserted = $("#materialData").datagrid('getChanges', "inserted");
	}
	var deleted = [];
	var updated = [];
	$.ajax({
		type:"post",
		url: url,
		dataType: "json",
		async :  false,
		data: ({
			info:infoStr,
			inserted: JSON.stringify(inserted),
			deleted: JSON.stringify(deleted),
			updated: JSON.stringify(updated)
		}),
		success: function (tipInfo){
			if(tipInfo){
				if(tipInfo.code!=200){
					$.messager.alert('提示', tipInfo.msg, 'warning');
					return;
				}
				$.messager.alert('提示','保存成功！','info');
				$('#depotHeadDlg').dialog('close');
				var opts = $("#tableData").datagrid('options');
				showDepotHeadDetails(opts.pageNumber,opts.pageSize);
			}else {
				$.messager.show({
					title: '错误提示',
					msg: '保存信息失败，请稍后重试!'
				});
			}
		},
		//此处添加错误处理
		error:function() {
			$.messager.alert('提示','保存信息异常，请稍后再试！','error');
			return;
		}
	});
}

//新增单据主表及单据子表
function addDepotHeadAndDetails2(url,infoStr,pd,inserted,cp){
	debugger
	var deleted = [];
	var updated = [];
	$.ajax({
		type:"post",
		url: url,
		dataType: "json",
		async :  false,
		data: ({
			info:infoStr,
			inserted: "["+inserted+"]",
			deleted: JSON.stringify(deleted),
			updated: JSON.stringify(updated)
		}),
		success: function (tipInfo){
			if(tipInfo){
				if(tipInfo.code!=200){
					$.messager.alert('提示', tipInfo.msg, 'warning');
					return;
				}
				if (pd==1) {
					mqk =mqk+cp+"出库成功";
				}else{
					gqk =gqk+cp+"出库成功";
				}

			}else {
				if (pd==1) {
					mqk =mqk+cp+"出库失败";
				}else{
					gqk =gqk+cp+"出库失败";
				}

			}
		},
		//此处添加错误处理
		error:function() {
			$.messager.alert('提示','保存信息异常，请稍后再试！','error');
			return;
		}
	});
}
//修改单据主表及单据子表
function updateDepotHeadAndDetail(url,infoStr,preTotalPrice) {
	debugger
	var inserted = $("#materialData").datagrid('getChanges', "inserted");
	var deleted = $("#materialData").datagrid('getChanges', "deleted");
	var updated = $("#materialData").datagrid('getChanges', "updated");
	var infoStrInfo = JSON.parse(infoStr);

	if (updated.length){
		if (contract == "否") {
			if (updated[0].contract == "是") {
				if (infoStrInfo.conyract_number == "" || infoStrInfo.myuploadFile == "") {
					if (infoStrInfo.conyract_number != ""){
						setStatusFunMPI("1");
						$.messager.alert('提示：', '您还为上传合同，请后续上传合同')
					} else if (infoStrInfo.myuploadFile == "") {
                        $.messager.alert('提示：', '合同编号未填写，请输入合同编号在进行修改合同状态,您还为上传合同，请后续上传合同')
                        return;
                    } else {
                        $.messager.alert('提示：', '合同编号未填写，请输入合同编号在进行修改合同状态')
                        return;
                    }
				} else {
					setStatusFunMPI("1");
				}
			}
		}
		if (payment == "否") {
			if (updated[0].payment == "是") {
				if (contract == "是") {
					setStatusFunMPI("6");
				} else {
					$.messager.alert('提示：', '合同处于未签订状态	，收款不能被修改');
					return;
				}
			}
		}
		if (invoice == "否") {
			if (updated[0].invoice == "是") {
				if (contract == "是" && payment == "是") {
				    if (infoStrInfo.invoice_number =="" || infoStrInfo.myuploadFiles==""){
                        $.messager.alert('提示：', '请完整填写发票信息！发票编号和上传底单！')
                        return;
                    }
					setStatusFunMPI("7");
				} else {
					$.messager.alert('提示：', '订单处于为未收款	，开票不能被修改');
					return;
				}
			}
		}
		if (gate == "否") {
			if (updated[0].gate == "是") {
				if (contract == "是" && payment == "是" && invoice == "是") {
					setStatusFunMPI("2");
				} else {
					$.messager.alert('提示：', '订单处于为未开票	，发货不能被修改');
					return;
				}
			}
		}
        if (install == "否") {
            if (updated[0].install == "是") {
                if (contract == "是" && payment == "是" && invoice == "是" && gate == "是") {
                    setStatusFunMPI("4");
                } else {
                    $.messager.alert('提示：', '订单处于为未发货	，安装不能被修改');
                    return;
                }
            }
        }
		if (gate == "是") {
			if (userdepot == "[10]") {

			} else {
				if (updated[0].gate != "是") {
					$.messager.alert('提示：', '您没有权限修改发货状态！如需变更请联系管理员');
					return;
				}
			}
		}
		if (install == "是") {
			if (userdepot == "[10]") {
			} else {
				if (updated[0].install != "是") {
					$.messager.alert('提示：', '您没有权限修改安装状态！如需变更请联系管理员');
					return;
				}
			}
		}
		if (invoice == "是") {
			if (userdepot == "[10]") {
			} else {
				if (updated[0].invoice != "是") {
					$.messager.alert('提示：', '您没有权限修改发票状态！如需变更请联系管理员');
					return;
				}
			}
		}
		if (payment == "是") {
			if (userdepot == "[10]") {
			} else {
				if (updated[0].payment != "是") {
					$.messager.alert('提示：', '您没有权限修改收款状态！如需变更请联系管理员');
					return;
				}
			}
		}
		if (contract == "是") {
			if (userdepot == "[10]") {

			} else {
				if (updated[0].contract != "是") {
					$.messager.alert('提示：', '您没有权限修改合同状态！如需变更请联系管理员');
					return;
				}
			}
		}
	}
	else {
		var up = $("#materialData").datagrid('getData');
		updated = up.rows;
		console.log(up);
		// $.messager.alert('提示：', '保存成功');
		// $('#depotHeadDlg').dialog('close');
		// return;
	}


	$.ajax({
		type:"post",
		url: url,
		data: ({
			id:url.substring(url.lastIndexOf("?id=")+4,url.length),
			info:infoStr,
		dataType: "json",
		async :  false,
			inserted: JSON.stringify(inserted),
			deleted: JSON.stringify(deleted),
			updated: JSON.stringify(updated),
			preTotalPrice:preTotalPrice
		}),
		success: function (tipInfo){
			if(tipInfo){
				if(tipInfo.code!=200){
					$.messager.alert('提示', tipInfo.msg, 'warning');
					return;
				}
				$.messager.alert('提示','保存成功！','info');
				$('#depotHeadDlg').dialog('close');
				var opts = $("#tableData").datagrid('options');
				showDepotHeadDetails(opts.pageNumber,opts.pageSize);
				if (endEditing()) {
					$('#materialData').datagrid('acceptChanges');
				}
			}else {
				$.messager.show({
					title: '错误提示',
					msg: '保存信息失败，请稍后重试!'
				});
			}
		},
		//此处添加错误处理
		error:function() {
			$.messager.alert('提示','保存信息异常，请稍后再试！','error');
			return;
		}
	});
}
//点击选择文件
function showFiles(){
	$("#myuploadFile").click();
}
function showFilesMSG(){
	$("#myuploadFiles").click();
}

//上传文件
function submitfile(e){
	// document.getElementById("inputFileAgent").value = document.getElementById("myuploadFile").value;
	var value=$("#myuploadFile").val();
	var types=value.split('.');
	// if(types[1]!='png'&&types[1]!='PNG'&&types[1]!='jpg'&&types[1]!='JPG'){
	// 	alert('请上传图片');
	// 	return ;
	// }
	console.log(e)//e就是你获取的file对象
	// var formData = $("#fileform").serializeObject();
	var formData = new FormData();
	formData.append('file', e.target.files[0])
	$.ajax({
		url: '/depotHead/uploadContract' ,
		type: 'POST',
		data: formData,
		async: false,
		cache: false,
		contentType: false,
		processData: false,
		success: function (data) {
			if(data=='error'){
				alert("上传失败");
			}else{
				var values=data.split('&');
				$("#showfile").attr('src','../images/'+values[0]);
				$("#i_img_url").val(values[0]);
				$.messager.alert('提示：','保存成功！');
			}
		},
		error: function (res) {
			alert(res);
		}
	});
}

//上传文件
function submitfiles(e){
	// document.getElementById("inputFileAgent").value = document.getElementById("myuploadFile").value;
	var value=$("#myuploadFiles").val();
	var types=value.split('.');
	// if(types[1]!='png'&&types[1]!='PNG'&&types[1]!='jpg'&&types[1]!='JPG'){
	// 	alert('请上传图片');
	// 	return ;
	// }
	console.log(e)//e就是你获取的file对象
	// var formData = $("#fileform").serializeObject();
	var formData = new FormData();
	formData.append('file', e.target.files[0])
	$.ajax({
		url: '/depotHead/uploadContract' ,
		type: 'POST',
		data: formData,
		async: false,
		cache: false,
		contentType: false,
		processData: false,
		success: function (data) {
			if(data=='error'){
				alert("上传失败");
			}else{
				var values=data.split('&');
				$("#showfile").attr('src','../images/'+values[0]);
				$("#i_img_url").val(values[0]);
				$.messager.alert('提示：','保存成功！');
			}
		},
		error: function (res) {
			alert(res);
		}
	});
}

function updateFile(id) {
    document.getElementById(id).click()
}