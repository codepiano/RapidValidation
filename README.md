RapidValidation
======

该项目是由baiqiu编写的RapidValidation校验框架

原始作者:
------

>modified by badqiu (badqiu(a)gmail.com)

>blog: http://badqiu.javaeye.com

>Project Home: http://code.google.com/p/rapid-validation/

>Rapid Framework Project Home: http://code.google.com/p/rapid-framework/

>Version 1.5.1

框架原始的依赖是prototype.js

为了以后维护和改造,将库的依赖替换成了jQuery

目前已完成了基本功能的改造,去掉了tooltip和effect

使用说明:
------

引用文件:

	<script src="jquery.js" type="text/javascript"></script>

	<script src="validation_cn.js" type="text/javascript"></script>

	<link rel="stylesheet" type="text/css" href="style_min.css"/>

	jquery.js 是所有的基础 请先引入jquery1.4+文件

	validation_cn.js 真正的验证框架文件

	可以添加 style_min.css 中的样式声明,也可以把style_min.css 中的样式声明引入到你的框架js 文件中去

为表单添加校验的方式:

	1.为 form 增加required-validate的class属性,标识需要验证的form,校验框架将使用默认的选项设置

	  eg:

		<form id='helloworld' action="#" class='required-validate'>

	2.初始化校验对象,传入表单元素,传入可选的选项设置对象

	  传入表单元素的方式由三种:通过jquery获取的form对象、通过dom获取的form对象、form的id

	  eg:

	  new Validation($('#form-id'));

	  或

	  new Validation(document.form[0]);

	  或

	  new Validation('form-id');
	  传入校验选项设置

	  eg:

		new Validation(

				document.forms[0],

				{

					onSubmit : true, //是否监听form的submit事件

					onReset : true, //是否监听form的reset事件

					stopOnFirst : false, //表单验证时停留在第一个验证的地方,不继续验证下去

					immediate : false, //是否实时检查数据的合法性

					focusOnError : true, //是否出错时将光标指针移到出错的输入框上

					useTitles : false, //是否使用input的title属性作为出错时的提示信息

					onFormValidate : function(result, form) {return result;},//Form验证时的回调函数,可以修改最终的返回结果

					onElementValidate : function(result, elm) {} //某个input验证时的回调函数

				}

		});

为表单添加校验项:

	在需要进行校验的表单后面指定相应的校验class属性

	eg:

	 通过class 添加验证: required 表示不能为空,min-length-15 表示表单内容最小长度为15

	 <textarea name='content' class='required min-length-15'></textarea>

在指定地方显示错误消息:

	默认情况下,错误消息会显示在校验的表单输入框的后面

	如果在html页面中发现advice-$inputId 的div,则错误消息的显示内容会显示在div中间

	自定义一个div标签,class为'validation-advice',

	id为'advice-校验对应的class的名字-对应的校验表单元素id'或者'advice-对应的校验表单元素id'

	例如<input type="text" id="test" class="required"/>

	如果html页面中有如下div标签,<div id="advice-required-test" class="validation-advice" ></div>

	或<div id="advice-test" class="validation-advice" ></div>

	错误信息会被显示到该div中

是否忽略空值和校验依赖:

	ValidatorDefaultOptions.prototype = {

		ignoreEmptyValue : true, //是否忽略空值

		depends : [ ] //相关依赖项

	}

	ignoreEmptyValue:输入框为空值时是否进行校验

	depends:必须先通过依赖校验,才能继续进行校验

	比如校验一个输入框内是否为整数且是否在一个整数范围内

	int-range',function(v,elm,args,metadata) {

		//校验逻辑

		},{depends : ['validate-integer']}]

	在进行校验时,框架会先对输入框的值进行validate-integer校验,如果通过,再继续进行int-range的校验

AJAX校验:

	1.不需要回调,并且只需要提交校验元素值的ajax校验:

	  必需为class增加validate-ajax-validateUrl的值

	  validateUrl为HTTP请求验证的URL,发送的请求会使用get方式提交当前绑定校验的表单元素的name=value对

	  如果服务器端返回非空字符串,将做为出错信息显示,空字符串则为成功

	  eg:

	    <input id='email' class='validate-ajax-http://localhost:8080/validate-email.jsp'>

	2.需要回调,并且只需要提交校验元素值的ajax校验:

	  必需为class增加validate-ajax-responseJudge-validateUrl的值

	  validateUrl为HTTP请求验证的URL,发送的请求会使用get方式提交当前绑定校验的表单元素的name=value字符串

	  对应的回调函数需事先绑定在Validator.callBack对象中,绑定形式为Validator.callBack[进行ajax校验的标签id] = 回调函数的引用

	  eg:

		为id为example并且进行ajax校验的元素绑定了回调函数callbackFunction

	    Validator.callBack['example'] = callbackFunction;

	    <input id='email' class='validate-ajax-responseJudge-http://localhost:8080/validate-email.jsp'>

	  请求结束后分以下三种情况进行处理:

	  1).如果返回值不为空且以'error:'开头,则返回的为错误信息,截取错误信息的正文,在Validator.callBack中寻找绑定的回调函数

	     将返回值作为参数调用回调函数,获取回调函数的返回结果,然后由框架进行错误信息的显示流程

	  2).如果返回值不为空且不以'error:'开头,则返回的是需要获取的数据,根据elm的id值,在Validator.callBack中寻找绑定的回调函数

	     将返回值作为参数调用回调函数,获取回调函数的返回结果,然后由框架进行错误信息的显示流程

	  3).如果返回值为空,则说明校验通过且没有返回数据

	3.需要回调,并且需要提交多个表单元素的值的ajax校验:

	  必需为class增加validate-ajax-responseJudge-multiParams-validateUrl的值

	  validateUrl为HTTP请求验证的URL,发送的请求会使用get方式提交标示的表单元素的name=value字符串

	  对应的回调函数需事先绑定在Validator.callBack对象中,绑定形式为Validator.callBack[进行ajax校验的标签id] = 回调函数的引用

	  eg:

		为id为example并且进行ajax校验的元素绑定了回调函数callbackFunction

	    Validator.callBack['example'] = callbackFunction;  

	    <input id='email' class='validate-ajax-responseJudge-http://localhost:8080/validate-email.jsp-id1-id2-id3'>

	  请求结束后的处理情况同2中的逻辑

自定义校验:

	可以在页面上添加自定义校验

	eg:

 	  Validator.messageSource['zh-cn'].push(['test-test','error message']); 
	  
	  第一个参数是校验名,即class属性的值,第二个参数是校验失败显示的错误信息

	  Validation.add('test-test',validateFunc); 
	  
	  第一个参数是校验名,第二个参数是进行校验的函数的引用,第三个参数是validator的选项,可以不填

	  在页面上即可使用该自定义校验,调用validateFunc进行校验,如果校验失败,则显示字符串error message

	  <textarea name='content' class='test-test'></textarea>

TODO
------

1. 修复过时正则校验逻辑

2. 增加新的自定义校验

3. 可能会添加Tooltip功能

4. 可能会添加Effect

