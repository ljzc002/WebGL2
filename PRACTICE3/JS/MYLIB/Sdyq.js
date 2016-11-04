/**
 * Created by Administrator on 2016/8/4.
 */
//物体本身的属性和初始化
sdyq={};//3D引擎
sdyq.object=function()
{//在地面上加速度运动的物体

}
sdyq.object.prototype.init = function(param)
{
    this.keys={w:0,s:0,a:0,d:0,space:0,ctrl:0,shift:0};//按键是否保持按下
    this.witha0={forward:0,left:0,up:-9.82};//非键盘控制产生的加速度
    this.witha={forward:0,left:0,up:-9.82};//环境加速度，包括地面阻力和重力，现在还没有风力
    this.witha2={forward:0,left:0,up:0};//键盘控制加速度与物体本身加速度合并后的最终加速度
    this.v0={forward:0,left:0,up:0};//上一时刻的速度
    this.vt={forward:0,left:0,up:0};//下一时刻的速度
    this.vm={forward:15,backwards:5,left:5,right:5,up:100,down:100};//各个方向的最大速度
    this.flag_song=0;//是否接触地面
    this.flag_runfast=1;//加快速度
    //this.ms0=0;//上一时刻毫秒数，这应该是整个场景共有的！！！！
    //this.mst=0;//下一时刻毫秒数
    this.ry0=0;//上一时刻的y轴转角
    this.ryt=0;//下一时刻的y轴转角
    this.rychange=0;//y轴转角差
    //this.schange=0;//秒差
    this.mchange={forward:0,left:0,up:0};//物体自身坐标系上的位移
    this.vmove=new BABYLON.Vector3(0,0,0);//世界坐标系中每一时刻的位移和量
    this.py0=0;//记录上一时刻的y轴位置，和下一时刻比较确定物体有没有继续向下运动！！

    param = param || {};
    this.mesh=param.mesh;
    this.mesh.scaling=param.scaling;
    this.mesh.position=param.position;
    this.mesh.rotation=param.rotation;
    this.mesh.checkCollisions=param.checkCollisions;
    this.mesh.ellipsoid=param.ellipsoid;
    this.mesh.ellipsoidOffset=param.ellipsoidOffset;
    this.meshname=this.mesh.name;
    this.skeletonsPlayer=param.skeletonsPlayer||[];
    this.submeshs=param.submeshs;
    this.ry0=param.mesh.rotation.y;
    this.py0=param.mesh.position.y;
    this.countstop=0;//记录物体静止了几次，如果物体一直静止就停止发送运动信息

    this.PlayAnnimation = false;

    this.methodofmove=param.methodofmove||"";
    switch(this.methodofmove)
    {
        case "controlwitha":
        {
            window.addEventListener("keydown", onKeyDown, false);//按键按下
            window.addEventListener("keyup", onKeyUp, false);//按键抬起
            break;
        }
        default :
        {
            break;
        }
    }
}
//骨骼动画
sdyq.object.prototype.beginSP=function(num_type)
{
    if(this.skeletonsPlayer.length>0)
    {
        this.sp = this.skeletonsPlayer[num_type];

        this.totalFrame = this.skeletonsPlayer[0]._scene._activeSkeletons.data.length;//总帧数
        this.start = 0;
        this.end = 100;
        this.VitesseAnim = parseFloat(100 / 100);//动画的速度比
        scene.beginAnimation(this.sp, (100 * this.start) / this.totalFrame, (100 * this.end) / this.totalFrame, true, this.VitesseAnim);//启动动画，skeletonsPlayer是一个骨骼动画对象
        this.PlayAnnimation = true;
    }
    else
    {//本体不能启动骨骼动画，则直接启动其子元素的骨骼动画
        var len=this.submeshs.length;
        for(var i=0;i<len;i++)
        {
            var skeleton=this.submeshs[i].skeleton;
            var totalFrame = skeleton._scene._activeSkeletons.data.length;//总帧数
            var start = 0;
            var end = 100;
            var VitesseAnim = parseFloat(100 / 100);//动画的速度比
            scene.beginAnimation(skeleton, (100 * start) / totalFrame, (100 * end) / totalFrame, true, VitesseAnim);
        }
        this.PlayAnnimation = true;
    }
}
sdyq.object.prototype.stopSP=function(num_type)
{
    this.PlayAnnimation = false;
    if(this.skeletonsPlayer.length>0)
    {
        scene.stopAnimation(this.skeletonsPlayer[0]);
    }
    else
    {
        var len=this.submeshs.length;
        for(var i=0;i<len;i++)
        {
            var skeleton=this.submeshs[i].skeleton;
            scene.stopAnimation(skeleton);
        }
    }
}

//键盘监听
//var keys={w:0,s:0,a:0,d:0,space:0,ctrl:0,shift:0};//按键是否保持按下，考虑到多客户端并行，那么势必每个player都有自己的keys！！
//var flag_runfast=1;//加快速度

function onKeyDown(event)
{
    var touche = event.keyCode;
    var ch = String.fromCharCode(touche);//键码转字符
    switch (touche) {
        case 16: // MAJ Le perso cours
        {
            for(var key in arr_myplayers)
            {
                if(arr_myplayers[key].methodofmove=="controlwitha")
                {
                    arr_myplayers[key].keys.shift = 1;
                    arr_myplayers[key].flag_runfast = 3;
                }
            }
            break;
        }
        case 32: // ESPACE le perso saute，空格是跳
        {
            for(var key in arr_myplayers)
            {
                if(arr_myplayers[key].methodofmove=="controlwitha")//根据对象所属的运动方式不同定义不同的键盘响应
                {
                    arr_myplayers[key].keys.space = 1;
                    arr_myplayers[key].witha.up=-9.82;
                    arr_myplayers[key].v0.up = 100;
                    arr_myplayers[key].flag_standonground=0;
                    arr_myplayers[key].vm.up=100;
                    arr_myplayers[key].vm.down=100;
                }
            }
            break;
        }
    }
    lastms=new Date();
    // Clavier AZERTY
    if (ch == "W")
    {
        for(var key in arr_myplayers)
        {
            if(arr_myplayers[key].methodofmove=="controlwitha")//根据对象所属的运动方式不同定义不同的键盘响应
            {
                arr_myplayers[key].keys.w=1;
            }
        }
    }
    if (ch == "D")
    {
        for(var key in arr_myplayers)
        {
            if(arr_myplayers[key].methodofmove=="controlwitha")
            {
                arr_myplayers[key].keys.d=1;
            }
        }
    }
    if (ch == "A")
    {
        for(var key in arr_myplayers)
        {
            if(arr_myplayers[key].methodofmove=="controlwitha")
            {
                arr_myplayers[key].keys.a=1;
            }
        }
    }
    if (ch == "S")
    {
        for(var key in arr_myplayers)
        {
            if(arr_myplayers[key].methodofmove=="controlwitha")
            {
                arr_myplayers[key].keys.s=1;
            }
        }
    }
}
// Gestion du clavier quand on relache une touche
function onKeyUp(event)
{
    var touche = event.keyCode;
    var ch = String.fromCharCode(touche);
    switch (touche) {
        case 16: // MAJ Le perso marche
        {
            for(var key in arr_myplayers)
            {
                if(arr_myplayers[key].methodofmove=="controlwitha")
                {
                    arr_myplayers[key].keys.shift = 0;
                    arr_myplayers[key].flag_runfast = 1;
                }
            }
            break;
        }
        case 32: // ESPACE le perso ne saute plus
        {
            for(var key in arr_myplayers)
            {
                if(arr_myplayers[key].methodofmove=="controlwitha")
                {
                    arr_myplayers[key].keys.space = 0;
                }
            }
            break;
        }
    }

    // Clavier AZERTY
    if (ch == "W")
    {
        for(var key in arr_myplayers)
        {
            if(arr_myplayers[key].methodofmove=="controlwitha")
            {
                arr_myplayers[key].keys.w=0;
            }
        }
    }
    if (ch == "D")
    {
        for(var key in arr_myplayers)
        {
            if(arr_myplayers[key].methodofmove=="controlwitha")
            {
                arr_myplayers[key].keys.d=0;
            }
        }
    }
    if (ch == "A")
    {
        for(var key in arr_myplayers)
        {
            if(arr_myplayers[key].methodofmove=="controlwitha")
            {
                arr_myplayers[key].keys.a=0;
            }
        }
    }
    if (ch == "S")
    {
        for(var key in arr_myplayers)
        {
            if(arr_myplayers[key].methodofmove=="controlwitha")
            {
                arr_myplayers[key].keys.s=0;
            }
        }
    }
}
//FindObj("a",Alert("a"));
function FindObj(logo,func)//用函数作为参数？！
{

}
/*
 * char：输入键值
 * char2：对比键值
 * arr：对象列表
 * methodofmove：运动方式
 * property：要修改的属性（使用eval？）
 * value：修改后的值
 * */
function ChangeKeysbyChar(char)//根据键值修改对应对象的值
{

}
function ChangeKeysbyCode()//根据键码修改对应对象的值
{

}
//obj_key是克隆对象
//arr是一些初始化参数
function MyCloneplayer(obj_key,arr)//根据mesh的具体情况决定使用何种克隆方式
{
    var Tom = new Player;
    var obj_p = {};
    if(obj_key.mesh.skeleton)//简单模型
    {
        obj_p.mesh = obj_key.mesh.clone(arr[14]+"@"+arr[0]);
        obj_p.mesh.skeleton=obj_key.mesh.skeleton.clone(arr[14]+"@"+arr[0] + "0");
        obj_p.skeletonsPlayer = [obj_p.mesh.skeleton];
        obj_p.submeshs=[];
    }
    else
    {
        //obj_p.mesh=obj_key.mesh.clone(arr[14]+"@"+arr[0]);
        obj_p.mesh=new BABYLON.Mesh("meshPlayer2",scene);
        obj_p.mesh.position=obj_key.mesh.position;
        obj_p.mesh.rotation=obj_key.mesh.rotation;
        obj_p.mesh.scaling=obj_key.mesh.scaling;
        var len=obj_key.submeshs.length;
        var arr_meshs=[];
        for(var i=0;i<len;i++)
        {
            var mesh=obj_key.submeshs[i].clone(arr[14]+"@"+arr[0] + i);
            mesh.skeleton=obj_key.submeshs[i].skeleton.clone();
            mesh.parent=obj_p.mesh;
            arr_meshs.push(mesh);
        }
        obj_p.submeshs=arr_meshs;
        if(obj_key.mesh.skeleton!=undefined) {//如果父元素本身拥有启动骨骼动画的能力，则直接克隆父元素的骨骼动画
            obj_p.skeletonsPlayer = [obj_key.skeletonsPlayer[0].clone("clonedSkeleton" + arr[0])];
        }
    }

    obj_p.scaling = new BABYLON.Vector3(parseFloat(arr[2]), parseFloat(arr[3]), parseFloat(arr[4]));//缩放
    obj_p.position = new BABYLON.Vector3(parseFloat(arr[5]), parseFloat(arr[6]), parseFloat(arr[7]));//位置
    obj_p.rotation = new BABYLON.Vector3(parseFloat(arr[8]), parseFloat(arr[9]), parseFloat(arr[10]));// 旋转
    obj_p.checkCollisions = true;//使用默认的碰撞检测
    obj_p.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);//碰撞检测椭球
    obj_p.ellipsoidOffset = new BABYLON.Vector3(0, 2, 0);//碰撞检测椭球位移

    obj_p.methodofmove = "controlwitha";
    obj_p.id = arr[0];
    obj_p.name = arr[0];
    obj_p.p1 = arr[11];
    obj_p.p2 = arr[12];
    obj_p.p3 = arr[13];
    Tom.init(
        obj_p
    );
    return Tom;
}