$(function(){
	//rem
	var deviceWidth = document.documentElement.clientWidth;
	document.documentElement.style.fontSize = deviceWidth / 7.5 + 'px';
	//click
	FastClick.attach(document.body);
	//
	var user_id="";
 	var current_linker="";
	var current_page="#page_login";
	var last_page="";
	
	//第一页page显示
	$("body .page").hide();
	$("body .page").eq(0).show();
	//加载账号密码
	(function(){
		var u=$.cookie("username"),
		p=$.cookie("password");
		if(u&&p){
			$("#username").val(u);
			$("#password").val(p);
		}
	})();
	//others_fun
	$("#others_fun").click(function(){
		$("#others_fun>div").toggle(200);
	})
	
	//turn
	function turn(page_id){
		$(current_page).animate({"opacity":"0"},200,function(){
			$(current_page)[0].scrollIntoView(true);
			$(page_id).css({"display":"block","left":"7.5rem"}).animate({"left":"0"},300,function(){
			$(current_page).css({"display":"none","opacity":"1"});
			last_page=current_page;
			current_page=page_id;	
		});;		
		})
	}
	//back
	function back(){
		if(last_page=="#page_login"||last_page==""){
			return;
		}		
		$(current_page).animate({"left":"8rem"},200,function(){
			$(current_page)[0].scrollIntoView(true);
			$(current_page).css("display","none");
			$(last_page).fadeIn(200);
				current_page=last_page;
				last_page="";
				current_linker="";
				$(current_page).css("z-index","1");
		});
	};

	//alert
	function malert(m){
		$("#alert span").text(m).parent().show();
	}
	$("#alert button").click(function(){
		$("#alert").hide();
	});
	
	//左滑返回上一层
	$("body")[0].ontouchstart=function(event){	 		
   		var touch = event.touches[0];
   		x0=touch.clientX;
   		y0=touch.clientY;
   	}
   	$("body")[0].ontouchmove=function(event){
		event.defaultPrevented;
   		 if(current_linker){
   		 	$("#page_"+current_linker+" input").blur();
   		 }
   	}
   	$("body")[0].ontouchend=function(event){
   		var touch = event.changedTouches[0];
   		x1=touch.clientX;
   		y1=touch.clientY;
   		x=x1-x0;
   		y=y1-y0;
   		if((x>2*y)&&(2*y>-x)){//右滑
   			back();
   			return false;
   		}
// 		if((x<y)&&(y>-x)){//下滑
// 		}
// 		if((x>y)&&(y<-x)){//上滑
// 			
// 		}
// 		if((x<y)&&(y<-x)){//左滑
// 		}
  }
   	
	//登录界面
	$("#re_password").click(function(){
		malert("请联系ZZP");
	})
	$("#login_register").click(function(){
		turn("#page_register");
	});

	//为login按钮绑定事件，包括验证用户信息，刷从服务器获取用户信息，更新页面等
	$("#login").click(function(){
		var username=$("#username").val();
		var password=$("#password").val();
		if(username==""){malert("账号不能为空"); return};
		if(password==""){malert("密码不能为空"); return};
		$.post("http://106.12.198.147/login.php",{username:$("#username").val(),password:$("#password").val()},function(echo){
			if(echo.code=="0"){
				malert(echo.error_message);
			}
			if(echo.code=="1"){
				//服务器会返回用户的联系人列表，以及联系人发的上一条信息
				//遍历friend对象，生成联系人列表
				turn("#page_linker");
				$("#global_head").css("display","block");
				for(var i in echo.friends){				
					var message=echo.friends[i]?echo.friends[i].message:"暂无消息";
					var time=echo.friends[i]?echo.friends[i].time:"";
					linker_list(i,"default",message,time);
					message_list(i);
				}
				user_id=$("#username").val();
				//从服务器获取消息
				receive_message();	
				$.cookie("username",username);
				$.cookie("password",password);
			}
		})
	});
	
	//注册界面
	$("#register_login").click(function(){
		turn("#page_login");
	});
	 //注册账号
 	$("#register").click(function(){
			var username2=$.trim($("#username2").val());
			var password2=$.trim($("#password2").val());
			if(username2==""){malert("账号不能为空");return;}
			if(password2==""){malert("密码不能为空");return;}
			if(checkusername(username2)){malert("用户名不符合规范，无法提交");return}
			$.post("http://106.12.198.147/regist.php",{username:""+$("#username2").val(),password:$("#password2").val()},function(echo){
				if(echo.code=="0"){
					malert(echo.error_message);
				}
				if(echo.code=="1"){
					malert("注册成功，账号为:"+username2);
					$("#username").val(username2);
					$("#password").val(password2);
				}
			});
		});
	//检测用户名输入是否规范
	function checkusername(u){
		var a="";
		switch(true){
 			case (!/^[a-zA-Z]/.test(u)):a="用户名必须以字母开头";break;
 			case ((u.length<4)):a="用户名至少为4位";break;
 			default :a="";
 		}	
 		return a;
	}
	//username2的keyup事件
 	$("#username2").keyup(function(){
 		var b=checkusername($(this).val());
   		if(b){
   			$("#register_tips").text(b).fadeIn(200);
   		}
   		else{
   			$("#register_tips").fadeOut(200);
   		}
 	});
		
	//联系人列表
	//添加好友
	$("#add_friend input").click(function(){
		$(this).focus();
	})
	$("#add_friend button").click(function(){
 		var username=$("#add_friend input").val();
 		if(username==""){
 			return;
 		}
 		if(username==user_id){
 			malert("不能添加自己为好友");
 			return;
 		}
 		//以后要改成json格式发送
 		$.post("http://106.12.198.147/add_friend.php",{a:$("#username").val(),b:$("#add_friend input").val()},function(echo){
 			if(echo.code=="0"){
 				malert(echo.error_message);
 			}
 			if(echo.code=="1"){
 				malert("好友申请已发送，请等待对方回应");
 			} 
 		})
 	});
	//生成联系人列表
	function linker_list(name,face_url,message,time){
		//生成联系人列表的html，并插入联系人列表里
		if(face_url=="default"){
			var face_url="chat_m/img/defaultyou.png";
		}
		var linker_text="<li class='linker "+name+"'><img src="+ face_url +" alt="+name+"/><div class=linker_name>"+name+"</div><p class=time>"+time+"</p><div class=pre_message>"+message+"</div><div class='linker_newmessage2'></div></li>";
		$("#page_linker .linker_list ul").append(linker_text);	
		//为新生成的列表绑定事件
		(function(n){
			$("#page_linker .linker_list ."+n).click(function(){
			current_linker=n;
			$(".linker_newmessage2",this).text("").removeClass("linker_newmessage");
			setTimeout(function(){
				$("#page_"+n+" .main")[0].scrollIntoView(false);				
			},400);
			turn("#page_"+n);
		});
		})(name);
	};
	
	//message_window
	//为每个联系人生成信息列表，并隐藏
    function message_list(friend){
		var list_text="<div id=page_"+friend+" class='page message_window' style='display:none'><div class=head><span>返回</span><h3>"+friend+"</h3></div><div class='main'><div class=send_message><form action=#><input type=text></form></div></div><div class='posi'></div></div>";
		$("body").append(list_text);
		//message_window交互
		(function(n){
			$("#page_"+n+" .head span").click(function(){
				back();
			});
			$("#page_"+n+" .send_message form").submit(function(){
				var	mes=$("#page_"+n+" .send_message input").val();
				 //在当前联系人的信息列表里添加信息
				if(mes.length==0){
					return false;
				}
				var user="defaultmy";
				//获取当前的时间和输入框的信息
				var now=new Date(),
					h=now.getHours(),
					m=now.getMinutes();
				if(h>=12){
					h=h==12?12:h-12;
					var time2=h+":"+m+" PM";
				}
				else{
					var time2=h+":"+m+" AM";
				}				
				send(user,time2,mes);
				//ajax请求后台数据
				var json_data={
					message:mes,
					time:time2,
					sender:user_id,
					receiveder:current_linker
				};
				$.post("http://106.12.198.147/send.php",{"data":JSON.stringify(json_data)},function(echo){
					if(echo.code=="0"){
						malert(echo.error_message);
					}
				});
				//清空input
				$("#page_"+n+" .send_message input").val("");
				//scroll
				$("#page_"+n)[0].scrollIntoView(false);
				return false;
			});		
			$("#page_"+n+" .posi").click(function(){
				$("#page_"+n+" .send_message input").focus();
			})
			$("#page_"+n+" .send_message input").click(function(){
				$(this).focus();
			}).focus(function(){
				$("#page_"+n+" .posi").css("display","none");
			});
			$("#page_"+n+" .main")[0].ontouchmove=function(){
				$("#page_"+n+" .send_message input").blur();
				$("#page_"+n+" .posi").fadeIn(500);
			};
		})(friend);
	};
	//发送信息
	function send(user_face,time,mes){			
			var h_text="<div class=my><img src=chat_m/img/"+user_face+".png class=my_face><p class='message_content'>"+mes+"</p></div>";
			$("#page_"+current_linker+" .main .send_message").before(h_text);				
	};

	//会在信息列表里生成新的信息，并更新联系人列表的简略信息
	function receive(user_face,time,mes,user_name){
			var h_text="<div class=you><img src='chat_m/img/"+user_face+".png' class=you_face><p class='message_content'>"+mes+"</p></div>";
			$("#page_"+user_name+" .main .send_message").before(h_text);
			$("#page_linker .linker_list  ."+user_name+" .pre_message").text(mes);
			$("#page_linker .linker_list  ."+user_name+" .time").text(time);
			$("#page_linker .linker_list ul").prepend($("#page_linker .linker_list ."+user_name));
	}
	//从服务器获取新的信息，如果有新的信息，就会用receive()函数更新当前页面数据
	function receive_message(){
		$.post("http://106.12.198.147/receive.php",{data:JSON.stringify({username:user_id})},function(echo){
			if(echo.code=="1"){
				for(var i in echo.message){
					for(var j in echo.message[i]){
						if(i=="A01"){
							A01_message(echo.message[i][j]);
							continue;
						}
						receive("defaultyou",echo.message[i][j].time,echo.message[i][j].message,i);
						//如果不是当前联系人，就在联系人列表里更新消息提示的数目
						if(i!=current_linker){
							var new_mes=$("#page_linker .linker_list ."+i+" .linker_newmessage2");
							var n=parseInt(new_mes.text())||0;
							if(n>=99){
								new_mes.addClass("linker_newmessage").text("99+");
							}
							else{
								new_mes.addClass("linker_newmessage").text(n+1);
							}
						}
						else{
							$("#page_"+i)[0].scrollIntoView(false);
							console.log(123);
						}
					}
				}
				
			}
			if(echo.code=="0"){
				malert(echo.error_message);
			}
		});
		setTimeout(receive_message,2000);
	}

//处理系统消息，根据不同类型的系统消息执行不同的函数来更新页面信息
	function A01_message(mes){
		var message=JSON.parse(mes.message);
		switch (message.type){
			case "add_friend":add_friend(message.a,message.b);break;
			case "refresh_linker":refresh_linker(message.linker);break;
//			case "system_message":system_message(message.content);break;
			default :break;
		}
	}
	//处理添加好友请求
	function add_friend(a,b){
		//生成新的元素添加到页面
		var h_text="<div class='addfriend "+a+"'><p><em>"+a+"<em/>请求添加您为好友</p><div><button class=yes>√</button><button class=no>×</button></div></div>";
		$("#page_linker .linker_list ul").prepend(h_text);
		//为新的元素绑定事件
		(function(a,b){
			$("#page_linker ."+a).click(function(){
				 $("#page_linker ."+a+" div").toggle(300);
			});
			$("."+a+" .yes").click(function(){			
					var par=$(".addfriend").filter("."+a);
					$.post("http://106.12.198.147/addfriend_yse.php",{"a":a,"b":b},function(echo){
					 if(echo.code=="1"){
						linker_list(a,"default","暂无消息","新添加的");
						message_list(a);
					 	par.animate({"width":"0"},300).animate({"height":"0"},300,function(){
							par.remove();
				        });
					}
				});
			});
			$("."+a+" .no").click(function(){
			var par=$(".addfriend").filter("."+a);
					par.animate({"width":"0"},300).animate({"height":"0"},300,function(){
						par.remove();
					});
		});
		})(a,b);
	}
	//处理刷新好友列表请求
	function refresh_linker(linker){
		var l=$("#page_linker .linker_list ul "+linker)
		if(l.length>0){
			return;
		}
		linker_list(linker,"default","暂无消息","新添加的");
		message_list(linker);
	}
	//处理系统消息请求(以后再做修改)
//	function system_message(content){
//		if($("#system_message").length>0){
//			$("#system_message span").eq(1).text(content);
//		}
//		else{
//			var h_text="<div id=system_message><span>系统消息：</span><span>"+content+"</span></div>";
//			$("#head h3").after(h_text);	
//		}
//		
//	}
})