/**
 * Created by Administrator on 2016/8/4.
 */
//各种对象

//可控对象
Player=function()
{
    sdyq.object.call(this);
}
Player.prototype=new sdyq.object();
Player.prototype.init=function(param)
{
    param = param || {};
    sdyq.object.prototype.init.call(this,param);//继承原型的方法
    this.flag_standonground=0;//是否接触地面
    this.keys={w:0,s:0,a:0,d:0,space:0,ctrl:0,shift:0};//按键是否保持按下，考虑到多客户端并行，那么势必每个player都有自己的keys！！
    this.flag_runfast=1;//加快速度
    this.name=param.name;
    this.id=param.id;
    this.p1=param.p1;
    this.p2=param.p2;
    this.p3=param.p3;

    //在玩家头上显示名字，clone时这个也会被clone过去，要处理一下！！！！
    var lab_texture=new BABYLON.Texture.CreateFromBase64String(texttoimg2(this.id),"datatexture"+this.id,scene);//使用canvas纹理，但这个纹理只能是不透明的！！
    var materialSphere1 = new BABYLON.StandardMaterial("texture1"+this.id, scene);
    materialSphere1.diffuseTexture = lab_texture;
    var plane = BABYLON.Mesh.CreatePlane("plane"+this.id, 2.0, scene, false, BABYLON.Mesh.FRONTSIDE);
    //You can also set the mesh side orientation with the values : BABYLON.Mesh.FRONTSIDE (default), BABYLON.Mesh.BACKSIDE or BABYLON.Mesh.DOUBLESIDE
    materialSphere1.diffuseTexture.hasAlpha = true;

    plane.position=new BABYLON.Vector3(0,75,0);//其父元素应用过0.05之缩放
    plane.rotation.y = Math.PI;
    plane.scaling.x=20;
    plane.scaling.y=4;
    plane.parent=this.mesh;

    plane.material=materialSphere1;
    //plane.material.diffuseTexture.uScale=1;
    //plane.material.diffuseTexture.vScale=1;

    /*var spriteManagerPlayer = new BABYLON.SpriteManager("playerManager", texttoimg(this.id), 1, 100, scene);
    var lab_name = new BABYLON.Sprite("player", spriteManagerPlayer);
    lab_name.parent=this.mesh;
    lab_name.position=this.mesh.position;*/

    //this.Sprite=lab_name;
    this.lab=plane;
}





//动物
Animal=function()
{
    sdyq.object.call(this);
}
Animal.prototype=new sdyq.object();
Animal.prototype.init=function(param)
{
    param = param || {};
    sdyq.object.prototype.init.call(this,param);//继承原型的方法
    this.flag_standonground=0;//是否接触地面
    this.fieldofvision=param.fieldofvision;//视野
    this.powerofmove=param.powerofmove;//移动力量
    //this.mesh.scaling=param.sizeofbody;//体型大小
    this.state=param.state;
    this.waitforturn=0;//eat情况下等待这些毫秒后改变运动方向
    this.id=param.id;
}


