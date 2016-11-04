/**
 * Created by Administrator on 2016/11/3.
 */
function createScene() //标准起式
{
    username=$("#str_name")[0].value;
    $("#btn_create")[0].disabled=true;
    engine = new BABYLON.Engine(canvas, true);
    engine.displayLoadingUI();
    scene = new BABYLON.Scene(engine);

    //启用重力和碰撞
    scene.collisionsEnabled = true;
    //scene.workerCollisions = true;//确实可以有效使用多核运算，加大帧数！！
    //但是worker是异步运算的，其数据传输策略会导致movewithcollition执行顺序与期望的顺序不符

    //定向光照
    var LightDirectional = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-2, -4, 2), scene);
    LightDirectional.diffuse = new BABYLON.Color3(1, 1, 1);//散射
    LightDirectional.specular = new BABYLON.Color3(0, 0, 0);//镜面
    LightDirectional.position = new BABYLON.Vector3(250, 400, 0);
    LightDirectional.intensity = 1.8;//强度
    shadowGenerator = new BABYLON.ShadowGenerator(1024, LightDirectional);//用在submesh上时一直在报错，不知道为了什么

    //相机
    cameraArcRotative[0] = new BABYLON.ArcRotateCamera("CameraBaseRotate", -Math.PI/2, Math.PI/2.2, 12, new BABYLON.Vector3(0, 5.0, 0), scene);
    cameraArcRotative[0].wheelPrecision = 15;//鼠标滚轮？
    cameraArcRotative[0].lowerRadiusLimit = 2;
    cameraArcRotative[0].upperRadiusLimit = 22;
    cameraArcRotative[0].minZ = 0;
    cameraArcRotative[0].minX = 4096;
    scene.activeCamera = cameraArcRotative[0];
    cameraArcRotative[0].attachControl(canvas);//控制关联

    //地面
    //name,url,width,height,subdivisions,minheight,maxheight,updateble,onready,scene
    ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "../IMAGE/map.jpg", 1000, 1000, 100, 0, 60, scene, true);//地面类型的网格
    var groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);//泥土材质
    groundMaterial.diffuseTexture = new BABYLON.Texture("../IMAGE/tree.png", scene);//地面的纹理贴图
    groundMaterial.diffuseTexture.uScale = 50.0;//纹理重复效果
    groundMaterial.diffuseTexture.vScale = 50.0;
    ground.material = groundMaterial;
    ground.checkCollisions = true;//检测碰撞
    ground.receiveShadows = true;//接收影子

    //墙
    var Mur = BABYLON.Mesh.CreateBox("Mur", 1, scene);
    Mur.scaling = new BABYLON.Vector3(15, 6, 1);
    Mur.position.y = 20;
    Mur.position.z = 20;
    Mur.checkCollisions = true;

    //角色导入，加载哪个mesh、文件目录、文件名、加入场景、回调函数
    BABYLON.SceneLoader.ImportMesh("", "../MODEL/him/", "him.babylon", scene, function (newMeshes, particleSystems, skeletons)
    {//载入完成的回调函数
        var Tom=new Player;
        var obj_p={};//初始化参数对象
        obj_p.mesh=newMeshes[0];//网格数据
        obj_p.scaling=new BABYLON.Vector3(0.05, 0.05, 0.05);//缩放
        obj_p.position=new BABYLON.Vector3(-5.168, 30.392, -7.463);//位置
        obj_p.rotation=new BABYLON.Vector3(0, 3.9, 0);// 旋转
        obj_p.checkCollisions=true;//使用默认的碰撞检测
        obj_p.ellipsoid=new BABYLON.Vector3(0.5, 1, 0.5);//碰撞检测椭球
        obj_p.ellipsoidOffset=new BABYLON.Vector3(0, 2, 0);//碰撞检测椭球位移
        obj_p.skeletonsPlayer=skeletons;
        obj_p.methodofmove="controlwitha";
        obj_p.name=username;
        obj_p.id=id;
        obj_p.p1="";
        obj_p.p2="../MODEL/him/";
        obj_p.p3="him.babylon";
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
        arr_myplayers[username]=Tom;

        if(state=="online")
        {
            var arr=[];
            arr.push("addnewplayer");
            arr.push(Tom.mesh.scaling.x);
            arr.push(Tom.mesh.scaling.y);
            arr.push(Tom.mesh.scaling.z);
            arr.push(Tom.mesh.position.x);
            arr.push(Tom.mesh.position.y);
            arr.push(Tom.mesh.position.z);
            arr.push(Tom.mesh.rotation.x);
            arr.push(Tom.mesh.rotation.y);
            arr.push(Tom.mesh.rotation.z);
            arr.push(Tom.p1);
            arr.push(Tom.p2);
            arr.push(Tom.p3);
            arr.push(Tom.meshname);
            var dt=new Date();
            console.log(dt.getTime()+"send addnewplayer"+id);
            doSend(arr.join("@"));
        }

        cameraArcRotative[0].alpha = -parseFloat(arr_myplayers[username].mesh.rotation.y) - 4.69;//初始化相机角度

    });
    //一次引入十个物体
    BABYLON.SceneLoader.ImportMesh("Rabbit", "../MODEL/Rabbit/", "Rabbit.babylon", scene, function (newMeshes, particleSystems, skeletons)
    {

        var rabbitmesh = newMeshes[1];
        //shadowGenerator.getShadowMap().renderList.push(rabbitmesh);//加入阴影渲染队列
        var rabbit=new Animal;
        var obj_p={
            mesh:rabbitmesh,
            scaling:new BABYLON.Vector3(0.04, 0.04, 0.04),//缩放
            position:new BABYLON.Vector3(Math.random()*100, 30, Math.random()*100),//位置
            rotation:new BABYLON.Vector3(0, Math.random()*6.28, 0),// 旋转
            //rotation:new BABYLON.Vector3(0, 0, 0),
            checkCollisions:true,//使用默认的碰撞检测
            ellipsoid:new BABYLON.Vector3(1, 1, 1),//碰撞检测椭球
            ellipsoidOffset:new BABYLON.Vector3(0, 0, 0),//碰撞检测椭球位移
            fieldofvision:50,//视野
            powerofmove:1,//移动力量
            methodofmove:"controlwitha",
            state:"eat",
            id:"rabbit"
        };
        rabbit.init(obj_p);
        arr_animals["rabbit"]=rabbit;
        scene.beginAnimation(rabbitmesh.skeleton, 0, 72, true, 0.8);
        console.log("rabbit");

        for(i=0;i<9;i++)
        {
            var rabbitmesh2 = rabbitmesh.clone("rabbit2"+(i+2));
            rabbitmesh2.skeleton = rabbitmesh.skeleton.clone("clonedSkeleton");
            var rabbit2=new Animal;
            var obj_p2={
                mesh:rabbitmesh2,
                scaling:new BABYLON.Vector3(0.04, 0.04, 0.04),//缩放
                position:new BABYLON.Vector3(Math.random()*100, 30, Math.random()*100),//位置
                rotation:new BABYLON.Vector3(0, Math.random()*6.28, 0),// 旋转
                //rotation:new BABYLON.Vector3(0, 0, 0),// 旋转
                checkCollisions:true,//使用默认的碰撞检测
                ellipsoid:new BABYLON.Vector3(1, 1, 1),//碰撞检测椭球
                ellipsoidOffset:new BABYLON.Vector3(0, 0, 0),//碰撞检测椭球位移
                fieldofvision:50,//视野
                powerofmove:1,//移动力量
                methodofmove:"controlwitha",
                state:"eat",
                id:"rabbit"+(i+2)
            };
            rabbit2.init(obj_p2);
            arr_animals["rabbit"+(i+2)]=rabbit2;
            scene.beginAnimation(rabbitmesh2.skeleton, 0, 72, true, 0.8);
            console.log("rabbit"+(i+2));
            //shadowGenerator.getShadowMap().renderList.push(rabbitmesh2);//报错
        }

    });
    //再引入一个物体，对比新建的物体与克隆的物体在碰撞检测和阴影效果上的差异
    BABYLON.SceneLoader.ImportMesh("Rabbit", "../MODEL/Rabbit/", "Rabbit.babylon", scene, function (newMeshes, particleSystems, skeletons)
    {
        var rabbitmesh = newMeshes[1];
        var rabbit=new Animal;
        var obj_p={
            mesh:rabbitmesh,
            scaling:new BABYLON.Vector3(0.04, 0.04, 0.04),//缩放
            position:new BABYLON.Vector3(Math.random()*100, 30, Math.random()*100),//位置
            rotation:new BABYLON.Vector3(0, Math.random()*6.28, 0),// 旋转
            //rotation:new BABYLON.Vector3(0, 0, 0),
            checkCollisions:true,//使用默认的碰撞检测
            ellipsoid:new BABYLON.Vector3(1, 1, 1),//碰撞检测椭球
            ellipsoidOffset:new BABYLON.Vector3(0, 0, 0),//碰撞检测椭球位移
            fieldofvision:50,//视野
            powerofmove:1,//移动力量
            methodofmove:"controlwitha",
            state:"eat",
            id:"rabbitx"
        };
        rabbit.init(obj_p);
        arr_animals["rabbitx"]=rabbit;
        scene.beginAnimation(rabbitmesh.skeleton, 0, 72, true, 0.8);
        console.log("rabbitx");
    });

    scene.registerBeforeRender(function()
    {//每次渲染前
        if(scene.isReady() && arr_myplayers)
        {//加载完毕
            if(sceneCharger == false) {
                engine.hideLoadingUI();//隐藏载入ui
                sceneCharger = true;
            }
            if(ms0==0)
            {//最开始，等一帧
                ms0=new Date();//设置初始时间
                schange=0;//初始化时间差
            }
            else
            {
                mst = new Date();//下一时刻
                schange = (mst - ms0) / 1000;
                ms0=mst;//时间越过
                //对于这段时间内的每一个物体
                for (var key in arr_myplayers)//该客户端所控制的物体
                {
                    var obj = arr_myplayers[key];
                    switch(obj.methodofmove)
                    {
                        case "controlwitha":
                        {
                            movewitha(obj);
                            //这里加上dosend！！！！，原地不动也发送吗？
                            if (state == "online")
                            {
                                if(obj.vmove.x==0&&obj.vmove.y==0&&obj.vmove.z==0&&obj.rychange==0)
                                {//如果位置和姿态不变
                                    if(obj.countstop>0)
                                    {//一直静止则不发送运动信息

                                    }
                                    else
                                    {
                                        obj.countstop+=1;
                                        //当前位置，当前角度，当前移动，当前姿态变化
                                        var arr = [];
                                        arr.push("updatemesh");
                                        arr.push(obj.mesh.position.x);
                                        arr.push(obj.mesh.position.y);
                                        arr.push(obj.mesh.position.z);
                                        arr.push(obj.mesh.rotation.x);
                                        arr.push(obj.mesh.rotation.y);
                                        arr.push(obj.mesh.rotation.z);
                                        arr.push(obj.vmove.x);
                                        arr.push(obj.vmove.y);
                                        arr.push(obj.vmove.z);
                                        arr.push(obj.rychange);
                                        doSend(arr.join("@"));
                                    }
                                }
                                else
                                {
                                    obj.countstop=0;
                                    //当前位置，当前角度，当前移动，当前姿态变化
                                    var arr = [];
                                    arr.push("updatemesh");
                                    arr.push(obj.mesh.position.x);
                                    arr.push(obj.mesh.position.y);
                                    arr.push(obj.mesh.position.z);
                                    arr.push(obj.mesh.rotation.x);
                                    arr.push(obj.mesh.rotation.y);
                                    arr.push(obj.mesh.rotation.z);
                                    arr.push(obj.vmove.x);
                                    arr.push(obj.vmove.y);
                                    arr.push(obj.vmove.z);
                                    arr.push(obj.rychange);
                                    doSend(arr.join("@"));
                                }
                            }

                            if((obj.vmove.x!=0||obj.vmove.y!=0||obj.vmove.z!=0||obj.rychange!=0)&&obj.PlayAnnimation==false)
                            {//如果开始运动，启动骨骼动画
                                obj.PlayAnnimation=true;
                                obj.beginSP(0);
                            }
                            else if(obj.vmove.x==0&&obj.vmove.y==0&&obj.vmove.z==0&&obj.rychange==0&&obj.PlayAnnimation==true)
                            {//如果运动结束，关闭骨骼动画
                                obj.PlayAnnimation=false;
                                scene.stopAnimation(obj.skeletonsPlayer[0]);
                            }
                            break;
                        }
                        default :
                        {
                            break;
                        }
                    }
                }
                for (var key2 in arr_webplayers)//对于由其他客户端控制的物体
                {
                    var obj = arr_webplayers[key2];
                    switch(obj.methodofmove)
                    {
                        case "controlwitha":
                        {
                            obj.lab.rotation.y=(-1.55 - cameraArcRotative[0].alpha)-obj.mesh.rotation.y;
                            if(obj.countstop<=4)
                            {
                                if ((obj.vmove.x != 0 || obj.vmove.y != 0 || obj.vmove.z != 0 || obj.rychange != 0)&& obj.PlayAnnimation == false) {
                                    obj.PlayAnnimation = true;
                                    obj.beginSP(0);
                                    obj.mesh.moveWithCollisions(obj.vmove);
                                }
                                else if (obj.vmove.x == 0 && obj.vmove.y == 0 && obj.vmove.z == 0 && obj.rychange == 0 && obj.PlayAnnimation == true) {
                                    obj.countstop++;
                                    if (obj.countstop > 4)//连续4帧没有该对象的运动信息传过来，则该物体的运动计算进入休眠
                                    {
                                        obj.PlayAnnimation = false;
                                        obj.stopSP(0);
                                    }
                                }
                            }
                            break;
                        }
                        default :
                        {
                            break;
                        }
                    }
                }

                if(username=="admin")//由主机对所有NPC物体的相互作用进行计算，在把作用结果同步到各个分机
                {
                    //计算每个动物和所有玩家的交互效果
                    var arr_rabbitmove=[];
                    for(var key in arr_animals)
                    {
                        var rabbit=arr_animals[key];
                        var v_face=new BABYLON.Vector3(0,0,0);
                        var newstate="eat";
                        for(var key2 in arr_myplayers)
                        {
                            var obj=arr_myplayers[key2];
                            var v_sub=rabbit.mesh.position.subtract(obj.mesh.position);
                            var distans=v_sub.length();
                            if(distans<rabbit.fieldofvision)//在视野内发现了人类
                            {
                                newstate="run";
                                v_face.addInPlace(v_sub.normalize().scaleInPlace(1/distans));
                            }
                        }
                        for(var key2 in arr_webplayers)
                        {
                            var obj=arr_webplayers[key2];
                            var v_sub=rabbit.mesh.position.subtract(obj.mesh.position);
                            var distans=v_sub.length();
                            if(distans<rabbit.fieldofvision)//在视野内发现了人类
                            {
                                newstate="run";
                                v_face.addInPlace(v_sub.normalize().scaleInPlace(1/distans));
                            }
                        }
                        if(newstate=="run"&&rabbit.state=="eat")
                        {//从eat状态变为run状态
                            rabbit.state="run";
                            rabbit.powerofmove=3;
                            scene.beginAnimation(rabbit.mesh.skeleton, 0, 72, true, 2.4);
                        }
                        else if(newstate=="eat"&&rabbit.state=="run")
                        {//从run状态变为eat状态
                            rabbit.state="eat";
                            rabbit.powerofmove=1;
                            scene.beginAnimation(rabbit.mesh.skeleton, 0, 72, true, 0.8);
                        }

                        var num_pi=Math.PI;
                        if(rabbit.state=="eat")//一直没有见到人类
                        {
                            rabbit.waitforturn+=schange;
                            if(rabbit.waitforturn>3)
                            {//每3秒随机决定一个运动方向
                                rabbit.waitforturn=0;
                                rabbit.witha0={forward:(Math.random()-0.5)*2*rabbit.powerofmove,up:0,left:(Math.random()-0.5)*2*rabbit.powerofmove};
                                rabbit.mesh.rotation.y=Math.random()*6.28;
                            }
                            movewitha(rabbit);
                            //这些兔子的数据汇总起来一起传
                            arr_rabbitmove.push([key,rabbit.mesh.position,rabbit.mesh.rotation,rabbit.vmove,rabbit.rychange,rabbit.state]);
                        }
                        else if(rabbit.state=="run")
                        {//奔跑远离人类
                            rabbit.witha0={forward:-rabbit.powerofmove,up:0,left:0};//这个是兔子的“自主加速度”！！不是世界加速度，也不是键盘控制产生的加速度
                            rabbit.mesh.rotation.y=(Math.atan(v_face.z/v_face.x)+num_pi*1/2);
                            movewitha(rabbit);
                            arr_rabbitmove.push([key,rabbit.mesh.position,rabbit.mesh.rotation,rabbit.vmove,rabbit.rychange,rabbit.state]);
                        }
                    }
                    var str_data="[admins]"+JSON.stringify(arr_rabbitmove);
                    doSend(str_data);
                }
            }
        }
    });

    engine.runRenderLoop(function () {
        scene.render();
        if(scene.isReady() && arr_myplayers[username].mesh){
            CameraFollowActor(arr_myplayers[username]);//根据人物重定位相机
        }
    });

    $("#div_canvas")[0].addEventListener("resize", function () { engine.resize();});//监听屏幕大小变化
}
//跟随着角色的旋转相机（法语）
function CameraFollowActor(object)
{
    if(object.flag_standonground==1) {
        object.mesh.rotation.y = -4.69 - cameraArcRotative[0].alpha;//角色的旋转角度，这样当相机旋转时角色也沿轴旋转，角色始终背对相机
    }
    cameraArcRotative[0].target.x = parseFloat(object.mesh.position.x);//而弧形旋转相机的中心点则由角色的位置决定，角色移动则弧形旋转相机的位置变化
    cameraArcRotative[0].target.y = parseFloat(object.mesh.position.y+3);
    cameraArcRotative[0].target.z = parseFloat(object.mesh.position.z);
}