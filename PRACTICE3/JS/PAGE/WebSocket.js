/**
 * Created by Administrator on 2016/10/12.
 */
var wsUri="";
var websocket;
var id="";//这个是sessionid！！

//建立连接
function Connect()
{//
    var location = (window.location+'').split('/');
    var IP=location[2];
    //wsUri="ws://"+IP+"/JUMP/websocket3";
    wsUri="ws://"+$("#str_ip")[0].value+":8081/PRACTICE/websocket3";
    try
    {
        websocket = new WebSocket(wsUri);//建立ws连接
        $("#str_ip")[0].disabled=true;
        $("#str_name")[0].disabled=true;
        username=$("#str_name")[0].value;
        $("#btn_create")[0].disabled=false;

        websocket.onopen = function(evt) //连接建立完毕
        {
            onOpen(evt)
        };
        websocket.onmessage = function(evt) {//收到服务器发来的信息
            onMessage(evt)
        };
        websocket.onclose = function(evt) {
            onClose(evt)
        };
        websocket.onerror = function(evt) {
            onError(evt)
        };
    }
    catch(e)
    {
        alert(e);
        $("#str_ip")[0].disabled=false;
        $("#str_name")[0].disabled=false;
    }
}
//连接建立完成的回调函数
function onOpen(evt) {
    state="online";
    doSend("@name:"+$("#str_name")[0].value);//连接建立后把浏览器端的用户信息传过去
}
//关闭连接
function Close()
{
    websocket.close();//浏览器端关闭连接

}
function onClose(evt) {
    writeToScreen('<span style="color: red;">本机连接关闭</span>');
    $("#str_ip")[0].disabled=false;
    $("#str_name")[0].disabled=false;
    state="offline";
}
//收到服务器端发来的消息
function onMessage(evt) {
    var str_data=evt.data;
    if(str_data.substr(0,4)=="@id:")//从服务端返回了sessionid
    {
        id=str_data.split(":")[1];
        $("#str_id")[0].innerHTML=id;
    }
    else if(str_data.substr(0,6)=="@name:")//从服务端返回了任命信息
    {
        username=str_data.split(":")[1];
        if(username=="admin")
        {
            $("#str_name")[0].value=username;
            writeToScreen('<span style="color: blue;">本机被任命为admin</span>');
        }
        else
        {
            $("#str_name")[0].value=username;
            writeToScreen('<span style="color: blue;">已存在admin，本机被重命名为'+username+'</span>');
        }
    }
    else if(str_data.substr(7,1)=="]")
    {
        var str=str_data.substr(0,8);
        switch (str)
        {
            case "[getonl]":
            {
                writeToScreen('<span style="color: blue;">'+str_data.substr(8)+'上线了</span>');
                break;
            }
            case "[getoff]":
            {
                writeToScreen('<span style="color: blue;">'+str_data.substr(8)+'下线了</span>');
                break;
            }
            case "[geterr]":
            {
                writeToScreen('<span style="color: blue;">'+str_data.substr(8)+'出错了</span>');
                break;
            }
            case "[admins]":
            {
                if(username=="admin")
                {//adminserver不处理admin广播

                }
                else
                {
                    if(!scene.isReady() || !arr_myplayers)
                    {
                        return;
                    }
                    var arr_rabbitmove=JSON.parse(str_data.substr(8));
                    var len=arr_rabbitmove.length;
                    for(var i=0;i<len;i++)
                    {
                        var arr=arr_rabbitmove[i];
                        var rabbit=arr_animals[arr[0]];
                        var rabbitmesh=rabbit.mesh;
                        rabbitmesh.position=arr[1];
                        rabbitmesh.rotation=arr[2];
                        rabbit.vmove=arr[3];
                        rabbit.rychange=arr[4];

                        if(arr[5]=="run"&&rabbit.state=="eat")
                        {
                            rabbit.state="run";
                            rabbit.powerofmove=3;
                            scene.beginAnimation(rabbitmesh.skeleton, 0, 72, true, 2.4);
                        }
                        else if(arr[5]=="eat"&&rabbit.state=="run")
                        {
                            rabbit.state="eat";
                            rabbit.powerofmove=1;
                            scene.beginAnimation(rabbitmesh.skeleton, 0, 72, true, 0.8);
                        }
                    }
                }
                break;
            }
        }
    }
    else
    {
        if(scene)
        {
            //writeToScreen('<span style="color: blue;">RESPONSE: ' + str_data + '</span>');

            var arr = str_data.split("@");//如果str_data很长这个方法会很慢
            if (arr.length > 2) {
                switch (arr[1]) {
                    case "updatemesh":
                    {
                        var dt=new Date();
                        console.log(dt.getTime()+"get updatemesh"+arr[0]);
                        var obj = arr_webplayers[arr[0]];//这一位存sessionid！！！！
                        if(obj)
                        {
                            var mesh = obj.mesh;
                            mesh.position.x = parseFloat(arr[2]);//这里已经产生了位移效果！！
                            mesh.position.y = parseFloat(arr[3]);
                            mesh.position.z = parseFloat(arr[4]);
                            mesh.rotation.x = parseFloat(arr[5]);
                            mesh.rotation.y = parseFloat(arr[6]);
                            mesh.rotation.z = parseFloat(arr[7]);
                            //obj.vmove += new BABYLON.Vector3(parseFloat(arr[8]), parseFloat(arr[9]), parseFloat(arr[10]));
                            obj.vmove.x=parseFloat(arr[8]);
                            obj.vmove.y=parseFloat(arr[9]);
                            obj.vmove.z=parseFloat(arr[10]);
                            //mesh.moveWithCollisions(obj.vmove);//积累起来，在该机器刷新时一起生效，只要位置同步好，丢失一些位移数据也可以接受
                            obj.rychange= parseFloat(arr[11]);
                            obj.countstop=0;//唤醒该物体的运动
                            if(obj.PlayAnnimation == false&&(obj.vmove.x != 0 || obj.vmove.y != 0 || obj.vmove.z != 0 || obj.rychange != 0))
                            {
                                obj.PlayAnnimation = true;
                                obj.beginSP(0);
                            }
                        }
                        break;
                    }

                    case "addnewplayer":
                    {//感知到加入了一个新的玩家，把新玩家加入到自己的场景里,先查询场景中是否已经有同名的mesh，如果有则使用clone方法同步加载，如果没有再使用import异步加，这样做的根本原因在于import方法导入模型的返回函数里无法自定义参数
                        var dt=new Date();
                        console.log(dt.getTime()+"get addnewplayer"+arr[0]);
                        var flag=0;
                        for(var key in arr_myplayers)
                        {
                            if(arr_myplayers[key].meshname==arr[14])//如果与主控物体的meshname相同
                            {

                                var obj_key=arr_myplayers[key];
                                arr_webplayers[arr[0]] = MyCloneplayer(obj_key,arr);
                                shadowGenerator.getShadowMap().renderList.push(arr_webplayers[arr[0]].mesh);
                                writeToScreen('<span style="color: blue;">addnewplayer: ' + arr[0] + '</span>');
                                flag=1;

                                //异步加入新玩家之后，还要把自己的信息发给新玩家，让新玩家添加自己（私聊）
                                addoldplayer(arr[0]);
                                break;
                            }
                        }
                        if(flag==0)//再在网络元素里查找
                        {
                            for(var key in arr_webplayers)
                            {
                                if(arr_webplayers[key].meshname==arr[14])//如果与主控物体的meshname相同
                                {
                                    var obj_key=arr_webplayers[key];
                                    arr_webplayers[arr[0]] = MyCloneplayer(obj_key,arr);
                                    shadowGenerator.getShadowMap().renderList.push(arr_webplayers[arr[0]].mesh);
                                    writeToScreen('<span style="color: blue;">addnewplayer: ' + arr[0] + '</span>');
                                    flag=1;
                                    //异步加入新玩家之后，还要把自己的信息发给新玩家，让新玩家添加自己（私聊）
                                    addoldplayer(arr[0]);
                                    break;
                                }
                            }
                        }
                        if(flag==0)//都没找着，就新建
                        {
                            //arr[14]保存着meshname可以作为异步方法间的纽带,如果发生同时加载两个一样的不存在的mesh时，让后来的那个通过websocket延时重发
                            if(tempobj[arr[14]]&&tempobj[arr[14]]!="OK")//这个暂存位正在被占用
                            {
                                doSend("privat:" + id + "#" + str_data);//请求websocket服务器再次把这个指令发给自己，以等待占用者完成操作
                            }
                            else
                            {
                                tempobj[arr[14]] = arr;
                                BABYLON.SceneLoader.ImportMesh(arr[11], arr[12], arr[13], scene, function (newMeshes, particleSystems, skeletons) {//载入完成的回调函数
                                    var Tom = new Player;
                                    var obj_p = {};
                                    obj_p.mesh = newMeshes[0];//网格数据
                                    var arr = tempobj[obj_p.mesh.name];
                                    obj_p.scaling = new BABYLON.Vector3(parseFloat(arr[2]), parseFloat(arr[3]), parseFloat(arr[4]));//缩放
                                    obj_p.position = new BABYLON.Vector3(parseFloat(arr[5]), parseFloat(arr[6]), parseFloat(arr[7]));//位置
                                    obj_p.rotation = new BABYLON.Vector3(parseFloat(arr[8]), parseFloat(arr[9]), parseFloat(arr[10]));// 旋转
                                    obj_p.checkCollisions = true;//使用默认的碰撞检测
                                    obj_p.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);//碰撞检测椭球
                                    obj_p.ellipsoidOffset = new BABYLON.Vector3(0, 2, 0);//碰撞检测椭球位移
                                    obj_p.skeletonsPlayer = skeletons;
                                    obj_p.methodofmove = "controlwitha";
                                    obj_p.id = arr[0];
                                    obj_p.name = arr[0];
                                    obj_p.p1 = arr[11];
                                    obj_p.p2 = arr[12];
                                    obj_p.p3 = arr[13];
                                    var len=newMeshes.length;//对于复杂的模型来说newMeshes的其他部分也必须保存下来
                                    var arr=[];
                                    for(var i=1;i<len;i++)
                                    {
                                        arr.push(newMeshes[i]);
                                    }
                                    obj_p.submeshs=arr;
                                    Tom.init(
                                        obj_p
                                    );
                                    tempobj[obj_p.mesh.name] = "OK";
                                    arr_webplayers[arr[0]] = Tom;
                                    shadowGenerator.getShadowMap().renderList.push(arr_webplayers[arr[0]].mesh);

                                    writeToScreen('<span style="color: blue;">addnewplayer: ' + arr[0] + '</span>');
                                    flag=1;
                                    //异步加入新玩家之后，还要把自己的信息发给新玩家，让新玩家添加自己（私聊）
                                    addoldplayer(arr[0]);

                                });
                            }
                        }
                        break;
                    }

                    case "addoldplayer":
                    {//添加一个前辈元素，此时默认前辈元素里已经有了本元素，所以不需要再通知前辈元素添加本元素，多个前辈元素同时返回如何处理？用出入栈方式？能保证先进先出？
                        var dt=new Date();
                        console.log(dt.getTime()+"get addoldplayer"+arr[0]);
                        var flag=0;
                        for(var key in arr_myplayers)
                        {
                            if(arr_myplayers[key].meshname==arr[14])//如果与主控物体的meshname相同
                            {
                                var obj_key=arr_myplayers[key];
                                arr_webplayers[arr[0]] =MyCloneplayer(obj_key,arr);
                                shadowGenerator.getShadowMap().renderList.push(arr_webplayers[arr[0]].mesh);
                                writeToScreen('<span style="color: blue;">addoldplayer: ' + arr[0] + '</span>');
                                flag=1;

                                break;
                            }
                        }
                        if(flag==0)//再在网络元素里查找
                        {
                            for(var key in arr_webplayers)
                            {
                                if(arr_webplayers[key].meshname==arr[14])//如果与主控物体的meshname相同
                                {
                                    var obj_key=arr_webplayers[key];
                                    arr_webplayers[arr[0]] =  MyCloneplayer(obj_key,arr);
                                    shadowGenerator.getShadowMap().renderList.push(arr_webplayers[arr[0]].mesh);
                                    writeToScreen('<span style="color: blue;">addoldplayer: ' + arr[0] + '</span>');
                                    flag=1;
                                    break;
                                }
                            }
                        }
                        if(flag==0)//都没找着，就新建
                        {
                            //arr[14]保存着meshname可以作为异步方法间的纽带,如果发生同时加载两个一样的不存在的mesh时，让后来的那个通过websocket延时重发
                            if(tempobj[arr[14]]&&tempobj[arr[14]]!="OK")//这个暂存位正在被占用
                            {
                                doSend("privat:" + id + "#" + str_data);//请求websocket服务器再次把这个指令发给自己，以等待占用者完成操作
                            }
                            else
                            {
                                tempobj[arr[14]] = arr;
                                BABYLON.SceneLoader.ImportMesh(arr[11], arr[12], arr[13], scene, function (newMeshes, particleSystems, skeletons) {//载入完成的回调函数
                                    var Tom = new Player;
                                    var obj_p = {};
                                    obj_p.mesh = newMeshes[0];//网格数据
                                    var arr = tempobj[obj_p.mesh.name];
                                    obj_p.scaling = new BABYLON.Vector3(parseFloat(arr[2]), parseFloat(arr[3]), parseFloat(arr[4]));//缩放
                                    obj_p.position = new BABYLON.Vector3(parseFloat(arr[5]), parseFloat(arr[6]), parseFloat(arr[7]));//位置
                                    obj_p.rotation = new BABYLON.Vector3(parseFloat(arr[8]), parseFloat(arr[9]), parseFloat(arr[10]));// 旋转
                                    obj_p.checkCollisions = true;//使用默认的碰撞检测
                                    obj_p.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);//碰撞检测椭球
                                    obj_p.ellipsoidOffset = new BABYLON.Vector3(0, 2, 0);//碰撞检测椭球位移
                                    obj_p.skeletonsPlayer = skeletons;
                                    obj_p.methodofmove = "controlwitha";
                                    obj_p.id = arr[0];
                                    obj_p.name = arr[0];
                                    obj_p.p1 = arr[11];
                                    obj_p.p2 = arr[12];
                                    obj_p.p3 = arr[13];
                                    var len=newMeshes.length;//对于复杂的模型来说newMeshes的其他部分也必须保存下来
                                    var arr=[];
                                    for(var i=1;i<len;i++)
                                    {
                                        arr.push(newMeshes[i]);
                                    }
                                    obj_p.submeshs=arr;
                                    Tom.init(
                                        obj_p
                                    );
                                    tempobj[obj_p.mesh.name] = "OK";
                                    arr_webplayers[arr[0]] = Tom;
                                    shadowGenerator.getShadowMap().renderList.push(arr_webplayers[arr[0]].mesh);
                                    writeToScreen('<span style="color: blue;">addoldplayer: ' + arr[0] + '</span>');
                                    flag=1;

                                });
                            }
                        }
                        break;
                    }
                }
            }
        }
    }
}
function addoldplayer(str_id)
{
    var Jerry = arr_myplayers[username];
    if (state == "online")
    {
        var arr2 = [];
        arr2.push("addoldplayer");
        arr2.push(Jerry.mesh.scaling.x);
        arr2.push(Jerry.mesh.scaling.y);
        arr2.push(Jerry.mesh.scaling.z);
        arr2.push(Jerry.mesh.position.x);
        arr2.push(Jerry.mesh.position.y);
        arr2.push(Jerry.mesh.position.z);
        arr2.push(Jerry.mesh.rotation.x);
        arr2.push(Jerry.mesh.rotation.y);
        arr2.push(Jerry.mesh.rotation.z);
        arr2.push(Jerry.p1);
        arr2.push(Jerry.p2);
        arr2.push(Jerry.p3);
        arr2.push(Jerry.meshname);
        var dt=new Date();
        console.log(dt.getTime()+"send addoldplayer"+id);
        doSend("privat:" + str_id + "#" + arr2.join("@"));
        //doSend("addplayer@"+JSON.stringify(obj_p));
    }
}

//发生错误
function onError(evt) {
    writeToScreen('<span style="color: red;">ERROR:</span> '+ evt.data);
    $("#str_ip")[0].disabled=false;
    $("#str_name")[0].disabled=false;
    state="offline";
}
//发送命令行信息
function Send()
{
    doSend($("#str_message")[0].value);
}
//向服务端发送信息
function doSend(message)
{
    websocket.send(message);
}
//写入操作日志
function writeToScreen(message)
{
    var pre = document.createElement("p");
    pre.style.wordWrap = "break-word";
    pre.innerHTML = MakeDateStr()+"->"+message;
    str_log.appendChild(pre);
}