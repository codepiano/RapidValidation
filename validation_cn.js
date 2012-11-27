/**
 * modified by badqiu (badqiu(a)gmail.com)
 * blog: http://badqiu.javaeye.com
 * Project Home: http://code.google.com/p/rapid-validation/
 * Rapid Framework Project Home: http://code.google.com/p/rapid-framework/
 * Version 1.5.1
 */

/*
 * Really easy field validation with Prototype
 * http://tetlaw.id.au/view/blog/really-easy-field-validation-with-prototype
 * Andrew Tetlaw
 * Version 1.5.3 (2006-07-15)
 *
 * Copyright (c) 2006 Andrew Tetlaw
 * http://www.opensource.org/licenses/mit-license.php
 */
/*备忘：
 *1).支持自定义错误信息显示位置，可自定义一个div标签，class为'validation-advice',id为'advice-name-input元素id',name为校验class的名字
 *2).如果input的值为空值也继续进行校验，可以通过设置validator的option选项为{ignoreEmptyValue:false}，默认input为空值则不校验
 *3).如果校验绑定的是checkbox或者radio元素，会寻找其父节点，将错误信息标签放在父节点的后面
 */

//设置验证的默认选项
var ValidationDefaultOptions = function(){};
ValidationDefaultOptions.prototype = {
	onSubmit : true, //是否监听form的submit事件
	onReset : true, //是否监听form的reset事件
	stopOnFirst : false, //表单验证时停留在第一个验证的地方,不继续验证下去
	immediate : false, //是否实时检查数据的合法性
	focusOnError : true, //是否出错时将光标指针移到出错的输入框上
	useTitles : false, //是否使用input的title属性作为出错时的提示信息
	onFormValidate : function(result, form) {return result;},//Form验证时的回调函数,可以修改最终的返回结果
	onElementValidate : function(result, elm) {} //某个input验证时的回调函数
}

//每个校验项的原型
var ValidatorDefaultOptions = function(){}
ValidatorDefaultOptions.prototype = {
	ignoreEmptyValue : true, //是否忽略空值
	depends : [] //相关依赖项
}

Validator = function() {
      this.initialize.apply(this, arguments);
    };


/*
 * 存放回调函数，存放的键为validate-ajax-responseJudge校验的input的id，值为对应的回调函数
 */
Validator.callBack = [];

//存放校验对应的错误信息
Validator.messageSource = {};
Validator.messageSource['en-us'] = [
['validation-failed' , 'Validation failed.'],
	['required' , 'This is a required field.'],
	['validate-number' , 'Please enter a valid number in this field.'],
	['validate-digits' , 'Please use numbers only in this field. please avoid spaces or other characters such as dots or commas.'],
	['validate-alpha' , 'Please use letters only (a-z) in this field.'],
	['validate-alphanum' , 'Please use only letters (a-z) or numbers (0-9) only in this field. No spaces or other characters are allowed.'],
	['validate-email' , 'Please enter a valid email address. For example fred@domain.com .'],
	['validate-url' , 'Please enter a valid URL.'],
	['validate-currency-dollar' , 'Please enter a valid $ amount. For example $100.00 .'],
	['validate-one-required' , 'Please select one of the above options.'],
	['validate-integer' , 'Please enter a valid integer in this field'],
	['validate-pattern' , 'Validation failed.'],
	['validate-ip','Please enter a valid IP address'],
	['min-value' , 'min value is %s.'],
	['max-value' , 'max value is %s.'],
	['min-length' , 'min length is %s,current length is %s.'],
	['max-length' , 'max length is %s,current length is %s.'],
	['int-range' , 'Please enter integer value between %s and %s'],
	['float-range' , 'Please enter number between %s and %s'],
	['length-range' , 'Please enter value length between %s and %s,current length is %s'],
	['equals','Conflicting with above value.'],
	['less-than','Input value must be less than above value.'],
	['less-than-equal','Input value must be less than or equal above value.'],
	['great-than','Input value must be great than above value.'],
	['great-than-equal','Input value must be great than or equal above value.'],
	['validate-date' , 'Please use this date format: %s. For example %s.'],
	['validate-selection' , 'Please make a selection.'],
	['validate-file' , function(v,elm,args,metadata) {
		return ValidationUtils.format("Please enter file type in [%s]",[args.join(',')]);
	}],
	//中国特有的相关验证提示信息
	['validate-id-number','Please enter a valid id number.'],
	['validate-chinese','Please enter chinese'],
	['validate-phone','Please enter a valid phone number,current length is %s.'],
	['validate-mobile-phone','Please enter a valid mobile phone,For example 13910001000.current length is %s.'],
	['validate-zip','Please enter a valid zip code.'],
	['validate-qq','Please enter a valid qq number']
	]

	Validator.messageSource['en'] = Validator.messageSource['en-us']

	//校验类型及其对应的错误信息，messageSource['zh-cn']是二维数组
	Validator.messageSource['zh-cn'] = [
	['validation-failed' , '验证失败.'],
	['required' , '请输入值.'],
	['validate-number' , '请输入有效的数字.'],
	['validate-digits' , '请输入数字.'],
	['validate-alpha' , '请输入英文字母.'],
	['validate-alphanum' , '请输入英文字母或是数字,其它字符是不允许的.'],
	['validate-email' , '请输入有效的邮件地址,如 username@example.com.'],
	['validate-url' , '请输入有效的URL地址.'],
	['validate-currency-dollar' , 'Please enter a valid $ amount. For example $100.00 .'],
	['validate-one-required' , '在前面选项至少选择一个.'],
	['validate-integer' , '请输入正确的整数'],
	['validate-pattern' , '输入的值不匹配'],
	['validate-ip','请输入正确的IP地址'],
	['min-value' , '最小值为%s'],
	['max-value' , '最大值为%s'],
	['min-length' , '最小长度为%s,当前长度为%s.'],
	['max-length', '最大长度为%s,当前长度为%s.'],
	['int-range' , '输入值应该为 %s 至 %s 的整数'],
	['float-range' , '输入值应该为 %s 至 %s 的数字'],
	['length-range' , '输入值的长度应该在 %s 至 %s 之间,当前长度为%s'],
	['equals','两次输入不一致,请重新输入'],
	['less-than','请输入小于前面的值'],
	['less-than-equal','请输入小于或等于前面的值'],
	['great-than','请输入大于前面的值'],
	['great-than-equal','请输入大于或等于前面的值'],
	['validate-date' , '请输入有效的日期,格式为 %s. 例如:%s.'],
	['validate-selection' , '请选择.'],
	['validate-file' , function(v,elm,args,metadata) {
		return ValidationUtils.format("文件类型应该为[%s]其中之一",[args.join(',')]);
	}],
	//中国特有的相关验证提示信息
	['validate-id-number','请输入合法的身份证号码'],
	['validate-chinese','请输入中文'],
	['validate-phone','请输入正确的电话号码,如:010-29392929,当前长度为%s.'],
	['validate-mobile-phone','请输入正确的手机号码,当前长度为%s.'],
	['validate-zip','请输入有效的邮政编码'],
	['validate-qq','请输入有效的QQ号码.']
	]

	/*
	 * param elm 表单元素对象
	 * param v validator对象
	 * 该类中为一些工具方法
	 */
	ValidationUtils = {
		//判断元素是否隐藏，一直上溯到非body的祖先节点
		isVisible : function(elm) {
						while(elm && !elm.is('body')) {
							if(elm.is(":visible") == false){
								return false;
							}
							elm = elm.parent();
						}
						return true;
					},
		//返回到表单元素所在的Form
		getReferenceForm : function(elm) {
							   while(elm && !elm.is('body')) {
								   if(elm.is('form')) return elm;
								   elm = elm.parent();
							   }
							   return null;
						   },
		//获取表单的值
		getInputValue : function(elm) {
							return elm.val();
						},
		//获取表单元素的ID，如果无ID，则返回name
		getElmID : function(elm) {
					   var id = elm.attr('id') ? elm.attr('id') : elm.attr('name');
					   if(id != undefined){
					   		id = id.replace('\.','\-');
					   }
					   return id;
				   },
		//用args数组中的值顺序替换%s,比如传入的str是%s-%s-%s,传入的args是[1,2,3],则处理后的结果是1-2-3
		format : function(str,args) {
					 args = args || [];
					 ValidationUtils.assert(args.constructor == Array,"ValidationUtils.format() arguement 'args' must is Array");
					 var result = str
						 for (var i = 0; i < args.length; i++){
							 result = result.replace(/%s/, args[i]);
						 }
					 return result;
				 },
		// 通过classname传递的参数必须通过'-'分隔各个参数，可以正确处理参数为负数的情况，返回参数数组results
		// 返回值results还有一个属性singleArgument,例:validate-pattern-/[a-c]/gi,singleArgument值为/[a-c]/gi
		// prefix为校验名，例如int-range-1-5，传入的prefix为int-range，返回[1,5],singleArgument的值为1-5
		getArgumentsByClassName : function(prefix,className) {
									  if(!className || !prefix)
										  return [];
									  var pattern = new RegExp(prefix+'-(\\S+)');
									  var matchs = className.match(pattern);
									  if(!matchs)
										  return [];
									  var results = [];
									  results.singleArgument = matchs[1];
									  var args =  matchs[1].split('-');
									  for(var i = 0; i < args.length; i++) {
										  if(args[i] == '') {
											  //处理形如int-range--10--5的情况
											  if(i+1 < args.length) args[i+1] = '-'+args[i+1];
										  }else{
											  results.push(args[i]);
										  }
									  }
									  return results;
								  },
		assert : function(condition,message) {
					 var errorMessage = message || ("assert failed error,condition="+condition);
					 if (!condition) {
						 alert(errorMessage);
						 throw new Error(errorMessage);
					 }else {
						 return condition;
					 }
				 },
		/*
		 * 判断是否是日期，如果不是日期，返回false
		 */
		isDate : function(v,dateFormat) {
					 var MONTH = "MM";
					 var DAY = "dd";
					 var YEAR = "yyyy";
					 var regex = '^'+dateFormat.replace(YEAR,'\\d{4}').replace(MONTH,'\\d{2}').replace(DAY,'\\d{2}')+'$';
					 if(!new RegExp(regex).test(v)) return false;

					 var year = v.substr(dateFormat.indexOf(YEAR),4);
					 var month = v.substr(dateFormat.indexOf(MONTH),2);
					 var day = v.substr(dateFormat.indexOf(DAY),2);

					 var d = new Date(ValidationUtils.format('%s/%s/%s',[year,month,day]));
					 return ( parseInt(month, 10) == (1+d.getMonth()) ) &&
						 (parseInt(day, 10) == d.getDate()) &&
						 (parseInt(year, 10) == d.getFullYear() );
				 },
		// prototype.js
		//document: http://ajaxcn.org/space/start/2006-05-15/2
		//没有找到调用
		//fireSubmit: function(form) {
		//				var form = $prototype(form);
		//				if (form.fireEvent) { //for ie
		//					if(form.fireEvent('onsubmit'))
		//						form.submit();
		//				} else if (document.createEvent) { // for dom level 2
		//					var evt = document.createEvent("HTMLEvents");
		//					//true for can bubble, true for cancelable
		//					evt.initEvent('submit', false, true);
		//					form.dispatchEvent(evt);
		//				}
		//			},
		//获取语言，从浏览器navigator对象中获取
		getLanguage : function() {
						  var lang = null;
						  if (typeof navigator.userLanguage == 'undefined')
							  lang = navigator.language.toLowerCase();
						  else
							  lang = navigator.userLanguage.toLowerCase();
						  return lang;
					  },
		//根据用户语言获取相应的错误提示信息
		getMessageSource : function() {
							   var lang = ValidationUtils.getLanguage();
							   var messageSource = Validator.messageSource['zh-cn'];
							   if(Validator.messageSource[lang]) {
								   messageSource = Validator.messageSource[lang];
							   }

							   var results = {};
							   for(var i = 0; i < messageSource.length; i++) {
								   results[messageSource[i][0]] = messageSource[i][1];
							   }
							   return results;
						   },
		//根据校验名获取相应的错误提示信息
		getI18nMsg : function(key) {
						 return ValidationUtils.getMessageSource()[key];
					 },
		//模拟prototype.js中的all方法
		all: function(collection,iterator) {
				 var result = true;
				 $.each(collection,function(value, index) {
					 result = result && !!(iterator || function(x){return x;})(value, index);
					 return result;
				 });
				 return result;
			 },
		//模拟prototype.js中的any方法
		any: function(collection,iterator) {
				 var result = true;
				 $.each(collection,function(value, index) {
					 result = result && !(iterator || function(x){return x;})(value, index);
					 return result;
				 });
				 return !result;
			 },
		getFormElements: function(form){
					rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i;
					rselectTextarea = /^(?:select|textarea)/i;
					return form.map(function(){
									return this.elements ? jQuery.makeArray( this.elements ) : this;
								})
								.filter(function(){
									return this.name && !this.disabled &&
										( this.checked || rselectTextarea.test( this.nodeName ) ||
											rinput.test( this.type ) );
								});
			}

	}
/*
 * 设置Validator的原型，Validator对象有三个成员变量，className, testFun, options，分别为类名，校验函数，自定义选项
 */
Validator.prototype = {
	/*
	 * 初始化validator，初始化的时候将ValidatorDefaultOptions中的属性复制到options中
	 */
	initialize : function(className, test, options) {
					 this.options =$.extend(new ValidatorDefaultOptions(), options || {});
					 this._test = test ? test : function(v,elm){ return true };
					 this._error = ValidationUtils.getI18nMsg(className) ? ValidationUtils.getI18nMsg(className) : ValidationUtils.getI18nMsg('validation-failed');
					 this.className = className;
					 this._dependsTest = $.proxy(this._dependsTest,this);
					 this.testAndGetError = $.proxy(this.testAndGetError,this);
					 this.testAndGetDependsError = $.proxy(this.testAndGetDependsError,this);
				 },
	//对设置的校验依赖进行测试，返回测试结果
	_dependsTest : function(v,elm) {
					   if(this.options.depends && this.options.depends.length > 0) {
						   var dependsResult = ValidationUtils.all(
								   $.makeArray(this.options.depends)
								   ,function(depend){
									   return Validation.get(depend).test(v,elm);
								   }
							);
						   return dependsResult;
					   }
					   return true;
				   },
	//进行校验，校验前先检查是否能通过依赖校验
	test : function(v, elm) {
			   if(!this._dependsTest(v,elm))
				   return false;
			   if(!elm) elm = {}
			   //是否忽略空值
			   var isEmpty = (this.options.ignoreEmptyValue && ((v == null) || (v.length == 0)));
			   var elmClass = "";
			   if(elm && elm[0]){
					elmClass = elm.attr('class');
			   }
			   return  isEmpty || this._test(v,elm,ValidationUtils.getArgumentsByClassName(this.className,elmClass),this);
		   },
	//进行依赖项的校验，获取错误提示信息
	testAndGetDependsError : function(v,elm) {
								 var depends = this.options.depends;
								 if(depends && depends.length > 0) {
									 var dependsError = null;
									 for(var i = 0; i < depends.length; i++) {
										 var dependsError = Validation.get(depends[i]).testAndGetError(v,elm);
										 if(dependsError) return dependsError;
									 }
								 }
								 return null;
							 },
	//进行校验，并获取错误提示信息
	testAndGetError : function(v, elm,useTitle) {
						  var dependsError = this.testAndGetDependsError(v,elm);
						  if(dependsError) return dependsError;

						  if(!elm) elm = {}
						  var isEmpty = (this.options.ignoreEmptyValue && ((v == null) || (v.length == 0)));
						  var result = isEmpty || this._test(v,elm,ValidationUtils.getArgumentsByClassName(this.className,elm.attr('class')),this);
						  if(!result) return this.error(v,elm,useTitle);
						  return null;
					  },
	//返回错误信息，如果错误信息为string，则替换其中的变量后返回，如果错误信息为函数，则调用函数，返回调用结果
	error : function(v,elm,useTitle) {
				var args  = ValidationUtils.getArgumentsByClassName(this.className,elm.attr('class'));
				var error = this._error;
				if(typeof error == 'string') {
					if(v) args.push(v.length);
					error = ValidationUtils.format(this._error,args);
				}else if(typeof error == 'function') {
					error = error(v,elm,args,this);
				}else {
					alert('property "_error" must type of string or function,current type:'+typeof error+" current className:"+this.className);
				}
				if(!useTitle){
					var classes = elm.attr('class') || "";
					useTitle = classes.indexOf('useTitle') >= 0;
				}
				return useTitle ? ((elm && elm.attr('title')) ? elm.attr('title') : error) : error;
			}
}


var Validation = function() {
      this.initialize.apply(this, arguments);
    };

//设置Validation的原型,Validation的所有校验方法存在Validation.methods中
//需要校验的form的信息存放在validations中
Validation.prototype = {
	/*
	 * Validation的初始化方法，初始化的时候将ValidationDefaultOptions中的属性复制到options中
	 */
	initialize : function(form, options){
					 this.options = $.extend(new ValidationDefaultOptions(), options || {});
					 if(form instanceof jQuery){
					 	this.form = form;
					 }else if(form.nodeType && form.tagName == 'FORM'){
					 	this.form = $(form);
					 }else if(typeof form === 'string'){ 
					 	this.form = $('#' + form);
					 }else{
					 	return;
					 }
					 var formId =  ValidationUtils.getElmID($(form));
					 Validation.validations[formId] = this;
					 if(this.options.onSubmit) this.form.bind('submit',$.proxy(this.onSubmit,this));
					 if(this.options.onReset) this.form.bind('reset',$.proxy(this.reset,this));
					 //对form表单中的元素绑定校验事件
					 if(this.options.immediate) {
						 var useTitles = this.options.useTitles;
						 var callback = this.options.onElementValidate;
						 var elements = ValidationUtils.getFormElements(this.form);
						 //没必要调用makeArray
						 for(var i = 0; i < elements.length; i++) {
							 var input = $(elements[i]);
							 input.bind('blur', function(ev) {
									 Validation.validateElement($(ev.target || ev.srcElement),{useTitle : useTitles, onElementValidate : callback});
								 });
						 }
					 }
				 },
	//提交校验，如果通不过校验，阻止提交事件
	onSubmit :  function(ev){
					if(!this.validate()) ev.stopPropagation();
				},
	//校验整个表单
	validate : function() {
				 var result = true;
				 var useTitles = this.options.useTitles;
				 var callback = this.options.onElementValidate;
				 var elements = ValidationUtils.getFormElements(this.form);
				 if(this.options.stopOnFirst) {
					for(var i = 0; i < elements.length; i++) {
						   var elm = $(elements[i]);
						   result = Validation.validateElement(elm,{useTitle : useTitles, onElementValidate : callback});
						   if(!result) break;
					   }
				   } else {
					   for(var i = 0; i < elements.length; i++) {
						   var elm = $(elements[i]);
						   if(!Validation.validateElement(elm,{useTitle : useTitles, onElementValidate : callback})) {
							   result = false;
						   }
					   }
				   }
				   //将焦点移动到校验失败的地方
				   if(!result && this.options.focusOnError) {
					   var first = $.grep(ValidationUtils.getFormElements(this.form),function(elm){return $(elm).hasClass('validation-failed')})[0];
					   if(first.select) first.select();
					   first.focus();
				   }
				   return this.options.onFormValidate(result, this.form);
			   },
	//重置form
	reset : function() {
				 var elements = ValidationUtils.getFormElements(this.form);
					for(var i = 0; i < elements.length; i++)
						Validation.reset($(elements[i]));
			}
}

//Object.extent是prototype.js中的函数，传入两个参数destination和source
//该函数会把source中的属性复制到destination中，模拟继承的效果
//如果destination中已存在同名属性，会被覆盖
$.extend(Validation, {
	//调用test函数校验表单元素
	validateElement : function(elm, options){
						  options = $.extend({
							  useTitle : false,
								  onElementValidate : function(result, elm) {}
						  }, options || {});
						  var classes = elm.attr('class') || '';
						  var cn = classes.split(/\s+/);
						  for(var i = 0; i < cn.length; i++) {
							  var className = cn[i];
							  var test = Validation.test(className,elm,options.useTitle);
							  options.onElementValidate(test, elm);
							  if(!test) return false;
						  }
						  return true;
					  },
	//创建显示错误信息的标签，使用span标签，class为'validation-advice',id为'advice-name-元素id'，通过display属性设置隐藏,name属性为传入参数，为校验class的名称
	//如果是checkbox或者radio元素，会寻找其父节点，将span标签放在父节点的后面
	//创建错误信息
	newErrorMsgAdvice : function(name,elm,errorMsg) {
							var advice = '<span class="validation-advice" id="advice-' + name + '-' + ValidationUtils.getElmID(elm) +'" style="display:none">&nbsp;&nbsp;' + errorMsg + '</span>';
							var tagName = '';
							if(elm.prop && elm.prop('tagName') != undefined){
							   tagName = elm.prop('tagName');
							}else{
							   tagName = elm.attr('tagName');
							}
						switch (tagName) {
							case 'checkbox':
							case 'radio':
								var p = elm.parent();
								if(p) {
									p.children(':last').after(advice);
								} else {
									elm.after(advice);
								}
								break;
							default:
									elm.after(advice);
						}
						advice = $('#advice-' + name + '-' + ValidationUtils.getElmID(elm));
						return advice;
					},
	//显示错误信息
	showErrorMsg : function(name,elm,errorMsg) {
					   var advice = Validation.getAdvice(name, elm);
					   if(!advice || !advice[0]) {
						   advice = Validation.newErrorMsgAdvice(name,elm,errorMsg);
					   }
					   if(advice && !advice.is(':visible')) {
							   advice.css('display','');
					   }
					   advice.text("  "+errorMsg);
					   //样式切换
					   elm.removeClass('validation-passed');
					   elm.addClass('validation-failed');
				   },
	//隐藏错误信息
	hideErrorMsg : function(name,elm) {
					   var advice = Validation.getAdvice(name, elm);
					   if(advice && advice.is(':visible')) {
						   advice.hide()
					   }
					   elm.removeClass('validation-failed');
					   elm.addClass('validation-passed');
				   },
	_getAdviceProp : function(validatorName) {
						 return '__advice'+validatorName;
					 },
	//校验表单元素，调用validator中的testAndGetError方法进行校验
	test : function(name, elm, useTitle) {
			   var v = Validation.get(name);
			   var errorMsg = null;
			   if(ValidationUtils.isVisible(elm))
				   //调用validator中的testAndGetError方法进行校验
				   errorMsg = v.testAndGetError(ValidationUtils.getInputValue(elm),elm,useTitle);
			   if(errorMsg) {
				   Validation.showErrorMsg(v.className,elm,errorMsg);
				   return false;
			   } else {
				   Validation.hideErrorMsg(v.className,elm);
				   return true;
			   }
		   },
	//获取信息提示div
	getAdvice : function(name, elm) {
					var advice = $('#advice-' + name + '-' + ValidationUtils.getElmID(elm));
					if(advice && advice[0]){
						return advice;
					}
					advice = $('#advice-' + ValidationUtils.getElmID(elm));
					if(advice && advice[0]){
						return advice;
					}
					return undefined;
				},
	//重置所有form表单，清楚框架附加的各种显示效果class，隐藏错误提示消息
	reset : function(elm) {
				var classes = elm.attr('class') || '';
				var cn = classes.split(/\s+/);
				for(var i = 0; i < cn.length; i++) {
					var value = cn[i];
					var className = Validation.get(value).className;
					if(className){
						var advice = Validation.getAdvice(className, elm);
						if(advice != undefined){
							advice.hide();
							elm.removeClass('validation-failed');
							elm.removeClass('validation-passed');
						}
					}
				}
			},
	//添加单个校验规则，function参数可以直接传入正则表达式对象，该函数会使用正则对象生成校验方法，进行校验。
	//options默认自动包括ValidatorDefaultOptions，同时支持通过传入options进行扩展，例如{depends : ['validate-integer']}
	add : function(className, test, options) {
			  var nv = {};
			  var testFun = test;
			  //处理校验规则是正则表达式对象的情况
			  if(test instanceof RegExp)
				  testFun = function(v,elm,args,metadata){ return test.test(v); }
			  //生成validator对象
			  nv[className] = new Validator(className, testFun, options);
			  $.extend(Validation.methods, nv);
		  },
	//添加多个校验规则，校验方法以二维数组的形式传入，第一维的每一个元素存放的是一个数组
	//第一个元素是校验函数的class名字，第二个是校验函数，第三个是自定义的option
	//调用Validation的add（class的名字，校验函数，自定义选项），将校验规则加入Validation
	addAllThese : function(validators) {
					  var validators = $.makeArray(validators);
					  for(var i = 0; i < validators.length; i++) {
						  var value = validators[i];
						  Validation.add(value[0], value[1], (value.length > 2 ? value[2] : {}));
					  }
				  },
	/*
	 * 根据class的名字获得对应的校验函数，支持模糊查询
	 * 如果存在，返回该class对应的校验函数
	 * 如果不存在，new一个Validator对象返回。
	 * 返回以methodName开头的最长匹配
     * 比如获取validate-ajax-responseJudge-multiParams-http://localhost:8080/test.do-id-id-id的校验方法
     * validate-ajax、validate-ajax-responseJudege、validate-ajax-responseJudge-multiParams都可以匹配
     * 框架会选择最长的并且最早出现的作为校验函数
	 */
	get : function(name) {
			  var resultMethodName;
			  var maxMatchLength = 0;
			  for(var methodName in Validation.methods) {
			  	if(name == methodName) {
			  		resultMethodName = methodName;
			  		break;
			  	}
			  	if(name.indexOf(methodName) == 0) {
			  		if(methodName.length > maxMatchLength){
			  			maxMatchLength = methodName.length;
			  			resultMethodName = methodName;
			  		}
			  	}
			  }
			  return Validation.methods[resultMethodName] ? Validation.methods[resultMethodName] : new Validator();
		  },
	//存放校验的validator，属性名是校验名，值是validator对象
	methods : {},
	//存放校验的Validation对象，属性名是form的id，值是Validation对象
	validations : {}
	});

Validation.addAllThese([
		['required', function(v) {
			return !((v == null) || (v.length == 0) || /^[\s|\u3000]+$/.test(v));
		},{ignoreEmptyValue:false}],
		['validate-number', function(v) {
			return (!isNaN(v) && !/^\s+$/.test(v));
		}],
		['validate-digits', function(v) {
			return !/[^\d]/.test(v);
		}],
		['validate-alphanum', function(v) {
			return !/\W/.test(v)
		}],
		['validate-one-required', function (v,elm) {
			var p = elm.parent();
			var options = $(':input',p);
			return ValidationUtils.any(options,function(elm) {
				return elm.val();
			});
		},{ignoreEmptyValue : false}],

		['validate-digits',/^[\d]+$/],
		['validate-alphanum',/^[a-zA-Z0-9]+$/],
		['validate-alpha',/^[a-zA-Z]+$/],
		['validate-email',/\w{1,}[@][\w\-]{1,}([.]([\w\-]{1,})){1,3}$/],
		['validate-url',/^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i],
		// [$]1[##][,###]+[.##]
		// [$]1###+[.##]
		// [$]0.##
		// [$].##
		['validate-currency-dollar',/^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/]
		]);

		//custom validate start

		Validation.addAllThese([
				/**
				 * Usage : equals-$otherInputId
				 * Example : equals-username or equals-email etc..
				 */
				['equals', function(v,elm,args,metadata) {
					var compareValue = $('#' + args[0]).val();
					return compareValue == v;
				},{ignoreEmptyValue:false}],
				/**
				 * Usage : less-than-$otherInputId
				 */
				['less-than', function(v,elm,args,metadata) {
					var compareValue = $('#' + args[0]).val();
					if(Validation.get('validate-number').test(v) && Validation.get('validate-number').test(compareValue))
						return parseFloat(v) < parseFloat(compareValue);
					return v < compareValue;
				}],
				/**
				 * Usage : less-than-equal-$otherInputId
				 */
				['less-than-equal', function(v,elm,args,metadata) {
					var compareValue = $('#' + args[0]).val();
					if(Validation.get('validate-number').test(v) && Validation.get('validate-number').test(compareValue))
						return parseFloat(v) <= parseFloat(compareValue);
					return v < compareValue || v == compareValue;
				}],
				/**
				 * Usage : great-than-$otherInputId
				 */
				['great-than', function(v,elm,args,metadata) {
					var compareValue = $('#' + args[0]).val();
					if(Validation.get('validate-number').test(v) && Validation.get('validate-number').test(compareValue))
						return parseFloat(v) > parseFloat(compareValue);
					return v > compareValue;
				}],
				/**
				 * Usage : great-than-equal-$otherInputId
				 */
				['great-than-equal', function(v,elm,args,metadata) {
					var compareValue = $('#' + args[0]).val();
					if(Validation.get('validate-number').test(v) && Validation.get('validate-number').test(compareValue))
						return parseFloat(v) >= parseFloat(compareValue);
					return v > compareValue || v == compareValue;
				}],
				/*
				 * Usage: min-length-$number
				 * Example: min-length-10
				 */
				['min-length',function(v,elm,args,metadata) {
					return v.length >= parseInt(args[0]);
				}],
				/*
				 * Usage: max-length-$number
				 * Example: max-length-10
				 */
				['max-length',function(v,elm,args,metadata) {
					return v.length <= parseInt(args[0]);
				}],
				/*
				 * Usage: validate-file-$type1-$type2-$typeX
				 * Example: validate-file-png-jpg-jpeg
				 */
				['validate-file',function(v,elm,args,metadata) {
					return ValidationUtils.any($.makeArray(args),function(extentionName) {
						return new RegExp('\\.'+extentionName+'$','i').test(v);
					});
				}],
				/*
				 * Usage: float-range-$minValue-$maxValue
				 * Example: -2.1 to 3 = float-range--2.1-3
				 */
				['float-range',function(v,elm,args,metadata) {
					return (parseFloat(v) >= parseFloat(args[0]) && parseFloat(v) <= parseFloat(args[1]))
				},{depends : ['validate-number']}],
				/*
				 * Usage: int-range-$minValue-$maxValue
				 * Example: -10 to 20 = int-range--10-20
				 */
				['int-range',function(v,elm,args,metadata) {
					return (parseInt(v) >= parseInt(args[0]) && parseInt(v) <= parseInt(args[1]))
				},{depends : ['validate-integer']}],
				/*
				 * Usage: length-range-$minLength-$maxLength
				 * Example: 10 to 20 = length-range-10-20
				 */
				['length-range',function(v,elm,args,metadata) {
					return (v.length >= parseInt(args[0]) && v.length <= parseInt(args[1]))
				}],
				/*
				 * Usage: max-value-$number
				 * Example: max-value-10
				 */
				['max-value',function(v,elm,args,metadata) {
					return parseFloat(v) <= parseFloat(args[0]);
				},{depends : ['validate-number']}],
				/*
				 * Usage: min-value-$number
				 * Example: min-value-10
				 */
				['min-value',function(v,elm,args,metadata) {
					return parseFloat(v) >= parseFloat(args[0]);
				},{depends : ['validate-number','required']}],
				/*
				 * Usage: validate-pattern-$RegExp
				 * Example: <input id='sex' class='validate-pattern-/^[fm]$/i'>
				 */
				['validate-pattern',function(v,elm,args,metadata) {
					return eval('('+args.singleArgument+'.test(v))');
				}],
				/*
				 * Usage: validate-ajax-$url
				 * Example: <input id='email' class='validate-ajax-http://localhost:8080/validate-email.jsp'>
				 */
				['validate-ajax',function(v,elm,args,metadata) {
					var params = elm.serialize();
					params += ValidationUtils.format("&what=%s&value=%s",[elm.name,encodeURIComponent(v)]);
					var request = $.ajax(
								{
									url:args.singleArgument,
									data:params,
									async:false,
									type:'get'
								}
							);
					var responseText = $.trim(request.responseText);
					if("" == responseText) return true;
					metadata._error = responseText;
					return false;
				}],
				/*
				 * Usage: validate-ajax-responseJudge-$url
				 * 建议使用validate-ajax-responseJudge-multiParams
				 * 支持回调函数
				 * 1).如果返回值不为空且以'error:'开头，则返回的为错误信息，截取错误信息的正文，由框架进行错误信息的显示流程
				 * 2).如果返回值不为空且不以'error:'开头，则返回的是数据，根据elm的id值，在Validator.callBack中寻找绑定的回调函数，将返回值作为参数传入
				 *    对应的回调函数需事先绑定在Validator.callBack中，绑定形式为Validator.callBack[标签id] = 回调函数的引用
				 *	  例如：Validator.callBack['example'] = callbackFunc;
				 * 3).如果返回值为空，则说明校验通过且没有返回数据
				 * Example: <input id='email' class='validate-ajax-responseJudge-multiParams-http://localhost:8080/validate-email.jsp'>
				 */
				['validate-ajax-responseJudge',function(v,elm,args,metadata) {
					var flag = true;    //该校验通过或不通过的标志位
					var params = elm.serialize();
					params += ValidationUtils.format("&what=%s&value=%s",[elm.name,encodeURIComponent(v)]);
					var request = $.ajax(
								{
									url:args[0],
									data:params,
									async:false,
									type:'get',
									success:function (msg){
										var responseText = $.trim(msg);
										if(responseText != '' && responseText.indexOf('error:') == 0){
											metadata._error = responseText.substring(6);
											flag = false;
										}else if(responseText != ''){
											var callbackFunc = Validator.callBack[elm.attr("id")]; //根绝elm的id获取绑定的回调函数
											if(callbackFunc != null && typeof(callbackFunc) == 'function'){
												flag = callbackFunc.call(this,responseText);
											}
										}else{
											flag = true;
										}
									}
								}
							);
					return flag;
				}],
				/*
				 * Usage: validate-ajax-responseJudge-multiParams-$url-id-id-id....
				 * 支持回调函数,不再序列化整个form,需要传多个值需要把对应的输入框的id拼在url后面
				 * 对应的回调函数需事先绑定在Validator.callBack中，绑定形式为Validator.callBack[标签id] = 回调函数的引用
				 * 例如：Validator.callBack['example'] = callbackFunction;
				 * 1).如果返回值不为空且以'error:'开头，则返回的为错误信息，截取错误信息的正文，在Validator.callBack中寻找绑定的回调函数
				 将返回值作为参数传入，然后由框架进行错误信息的显示流程
				 * 2).如果返回值不为空且不以'error:'开头，则返回的是需要获取的数据，根据elm的id值，在Validator.callBack中寻找绑定的回调函数，将返回值作为参数传入
				 * 3).如果返回值为空，则说明校验通过且没有返回数据
				 * Example: <input id='email' class='validate-ajax-responseJudge-multiParams-http://localhost:8080/validate-email.jsp-id-id-id'>
				 */
				['validate-ajax-responseJudge-multiParams',function(v,elm,args,metadata) {
					var flag = true;	//该校验通过或不通过的标志位
					var params = elm.serialize();
					for(var i = 1;i < args.length;i=i+1){
						var element = $('#' + args[i]);
							if(element && element[0]){
								params = params + '&' + element.serialize();
							}
					}
					var currentDate = new Date();
					params = params + '&_datetime=' + currentDate;
					var request = $.ajax(
								{
									url:args[0],
									data:params,
									async:false,
									type:'get',
									success:function(msg){
										var responseText = $.trim(msg);
										if(responseText != '' && responseText.indexOf('error:') == 0){
											metadata._error = responseText.substring(6);
											flag = false;
										}else if(responseText != ''){
											var callbackFunc = Validator.callBack[elm.attr("id")]; //根绝elm的id获取绑定的回调函数
											if(callbackFunc != null && typeof(callbackFunc) == 'function'){
												flag = callbackFunc.call(this,responseText);
											}
										}else{
											flag = true;
										}
									}
								}
							);
					return flag;
				}],
				/*
				 * Usage: validate-dwr-${service}.${method}
				 * Example: <input id='email' class='validate-dwr-service.method'>
				['validate-dwr',function(v,elm,args,metadata) {
					var result = false;
					var callback = function(methodResult) {
						if(methodResult)
							metadata._error = methodResult;
						else
							result = true;
					}
					var call = args.singleArgument+"('"+v+"',callback)";
					DWREngine.setAsync(false);
					eval(call);
					DWREngine.setAsync(true);
					return result;
				}],
				 */
				/*
				 * Usage: validate-buffalo-${service}.${method}
				 * Example: <input id='email' class='validate-buffalo-service.method'>
				['validate-buffalo',function(v,elm,args,metadata) {
					var result = false;
					var callback = function(reply) {
						if(replay.getResult())
							metadata._error = replay.getResult();
						else
							result = true;
					}
					if(!BUFFALO_END_POINT) alert('not found "BUFFALO_END_POINT" variable');
					var buffalo = new Buffalo(BUFFALO_END_POINT,false);
					buffalo.remoteCall(args.singleArgument,v,callback);
					return result;
				}],
				 */
				/*
				 * Usage: validate-date-$dateFormat or validate-date($dateFormat default is yyyy-MM-dd)
				 * Example: validate-date-yyyy/MM/dd
				 */
				['validate-date', function(v,elm,args,metadata) {
					var dateFormat = args.singleArgument || 'yyyy-MM-dd';
					metadata._error = ValidationUtils.format(ValidationUtils.getI18nMsg(metadata.className),[dateFormat,dateFormat.replace('yyyy','2006').replace('MM','03').replace('dd','12')]);
					return ValidationUtils.isDate(v,dateFormat);
				}],
				['validate-selection', function(v,elm,args,metadata) {
					return elm[0].options ? elm[0].selectedIndex > 0 : !((v == null) || (v.length == 0));
				}],
				['validate-integer',/^[-+]?[1-9]\d*$|^0$/],
				['validate-ip',/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/],

				//中国相关验证开始
				['validate-id-number',function(v,elm,args,metadata) {
					if(!(/^\d{17}(\d|x)$/i.test(v) || /^\d{15}$/i.test(v))) return false;
					var provinceCode = parseInt(v.substr(0,2));
					if((provinceCode < 11) || (provinceCode > 91)) return false;
					var forTestDate = v.length == 18 ? v : v.substr(0,6)+"19"+v.substr(6,15);
					var birthday = forTestDate.substr(6,8);
					if(!ValidationUtils.isDate(birthday,'yyyyMMdd')) return false;
					if(v.length == 18) {
						v = v.replace(/x$/i,"a");
						var verifyCode = 0;
						for(var i = 17;i >= 0;i--)
							verifyCode += (Math.pow(2,i) % 11) * parseInt(v.charAt(17 - i),11);
						if(verifyCode % 11 != 1) return false;
					}
					return true;
				}],
				['validate-chinese',/^[\u4e00-\u9fa5]+$/],
				['validate-phone',/^((0[1-9]{3})?(0[12][0-9])?[-])?\d{6,8}$/],
				['validate-mobile-phone',/(^0?[1][3458][0-9]{9}$)/],
				['validate-zip',/^[1-9]\d{5}$/],
				['validate-qq',/^[1-9]\d{4,9}$/]
				]);

				//初始化，绑定所有需要校验的form，同时绑定reset事件
				//根据class为require-validate来确定form需要被校验
				Validation.autoBind = function() {
					var forms = $('.required-validate');
					for(var i = 0; i < forms.length; i++) {
						var form = $(forms[i]);
						var validation = new Validation(form,{immediate:true,useTitles:true,stopOnFirst:true});
						form.bind('reset',function() {validation.reset();});
					}
				};
//初始化
$(Validation.autoBind);
