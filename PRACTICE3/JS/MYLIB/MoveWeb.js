/**
 * Created by Administrator on 2016/10/12.
 */
/**
 * Created by Administrator on 2016/10/8.
 */
//各种运动方式
function movewitha(obj)//地面上带有加速度的运动，必须站在地上才能加速，与宇宙空间中的喷气式加速度相比较
{
    //每一帧都会触发这里
    /*if(obj.ry0==0&&obj.py0==0) 这一步骤放在初始化里进行
     {
     obj.ry0=obj.mesh.rotation.y;
     obj.py0=obj.mesh.position.y;
     }*/
    obj.ryt=obj.mesh.rotation.y;
    obj.rychange=parseFloat(obj.ryt - obj.ry0);
    obj.ry0=obj.ryt;
    //根据需要启动移动对应的骨骼动画
    /*if (obj.PlayAnnimation === false && (obj.v0.forward != 0 || obj.v0.left != 0||obj.v0.up!=0))//如果没有动画但又在运动
    {
        obj.beginSP(0);
        obj.PlayAnnimation=true;
    }*/
    //将上一时刻的速度投影到下一时刻的坐标里
    var v0t = {forward: 0, left: 0, up: 0};
    v0t.forward = obj.v0.forward * parseFloat(Math.cos(obj.rychange)) + (-obj.v0.left * parseFloat(Math.sin(obj.rychange)));
    v0t.left = (obj.v0.forward * parseFloat(Math.sin(obj.rychange))) + (obj.v0.left * parseFloat(Math.cos(obj.rychange)));
    v0t.up = obj.v0.up;
    obj.v0 = v0t;

    //计算水平加速度
    if(obj.flag_standonground==1)//在地面上才能使用水平加速度
    {
        //移动速度产生的阻力，只考虑地面阻力，不考虑空气阻力
        if (obj.v0.forward == 0) {
            obj.witha.forward = 0;
        }
        else if (obj.v0.forward > 0) {
            obj.witha.forward = -0.5;
        }
        else {
            obj.witha.forward = 0.5;
        }
        if (obj.v0.left == 0) {
            obj.witha.left = 0;
        }
        else if (obj.v0.left > 0) {
            obj.witha.left = -0.5;
        }
        else {
            obj.witha.left = 0.5;
        }
        //最终加速度由环境加速度和物体自身加速度叠加而成
        obj.witha2.forward = obj.witha.forward+obj.witha0.forward;
        obj.witha2.left = obj.witha.left+obj.witha0.left;
        //根据键盘操作设置加速度
        //处理前后
        if (obj.keys.w != 0) {
            obj.witha2.forward += 5;
        }
        else if (obj.keys.s != 0) {
            obj.witha2.forward -= 2;
        }
        //处理左右
        if (obj.keys.a != 0 && obj.keys.d != 0) {//同时按下左右键则什么也不做

        }
        else if (obj.keys.a != 0) {
            obj.witha2.left += 2;
        }
        else if (obj.keys.d != 0) {
            obj.witha2.left -= 2;
        }
    }
    else
    {
        obj.witha2.forward=0;
        obj.witha2.left=0;
    }
    //根据水平加速度计算水平运动
    if(obj.witha2.forward!=0)
    {
        obj.vt.forward = obj.v0.forward + obj.witha2.forward * schange;//速度变化
        if((0 < obj.vt.forward && obj.vt.forward < obj.vm.forward) || (0 > obj.vt.forward && obj.vt.forward > -obj.vm.backwards))
        {//在最大速度范围内
            obj.mchange.forward = obj.witha2.forward * schange * schange + obj.v0.forward * schange;//加速度产生的距离变化
        }
        else if (obj.vm.forward <= obj.vt.forward) {
            obj.vt.forward = obj.vm.forward;
            obj.mchange.forward = obj.vt.forward * schange;
        }
        else if (-obj.vm.backwards >= obj.vt.forward) {
            obj.vt.forward = -obj.vm.backwards;
            obj.mchange.forward = obj.vt.forward * schange;
        }
    }
    else {
        obj.mchange.forward = obj.v0.forward * schange;
    }
    if(obj.witha2.left!=0)
    {
        obj.vt.left = obj.v0.left + obj.witha2.left * schange;//速度变化
        if((0 < obj.vt.left && obj.vt.left < obj.vm.left) || (0 > obj.vt.left && obj.vt.left > -obj.vm.right))
        {//在最大速度范围内
            obj.mchange.left = obj.witha2.left * schange * schange + obj.v0.left * schange;//加速度产生的距离变化
        }
        else if (obj.vm.left <= obj.vt.left) {
            obj.vt.left = obj.vm.left;
            obj.mchange.left = obj.vt.left * schange;
        }
        else if (-obj.vm.right >= obj.vt.left) {
            obj.vt.left = -obj.vm.right;
            obj.mchange.left = obj.vt.left * schange;
        }
    }
    else {
        obj.mchange.left = obj.v0.left * schange;
    }
    //垂直加速度单独计算
    //obj.witha.up=-9.82;

    //正在下落，但没有下落应有的距离
    if(obj.v0.up<0&&obj.flag_standonground==0&&((obj.py0-obj.mesh.position.y)<(-obj.mchange.up)/5))
    {
        obj.v0.up=0;
        obj.flag_standonground=1;
        obj.witha.up=-0.5;//考虑到下坡的存在，还要有一点向下的分量，使其能够沿地面向下但又不至于抖动过于剧烈
        obj.vm.up=5;
        obj.vm.down=5;
    }
    else if(obj.flag_standonground==1&&((obj.py0-obj.mesh.position.y)>(-obj.mchange.up)/5))//遇到了一个坑
    {
        obj.flag_standonground=0;
        obj.witha.up=-9.82;
        obj.vm.up=100;
        obj.vm.down=100;
    }
    obj.witha2.up = obj.witha.up;
    if (obj.witha2.up != 0&&(obj.flag_standonground==0||(obj.flag_standonground==1&&(obj.mchange.left!=0||obj.mchange.forward!=0)))) {//不在地面才考虑上下加速移动

        obj.vt.up = obj.v0.up + obj.witha2.up * schange;//速度变化
        if ((0 < obj.vt.up && obj.vt.up < obj.vm.up) || (0 > obj.vt.up && obj.vt.up > -obj.vm.down)) {
            obj.mchange.up = obj.witha2.up * schange * schange + obj.v0.up * schange;//加速度产生的距离变化
        }
        else if (obj.vm.up <= obj.vt.up) {
            obj.vt.up = obj.vm.up;
            obj.mchange.up = obj.vt.up * schange;
        }
        else if (-obj.vm.down >= obj.vt.up) {
            obj.vt.up = -obj.vm.down;
            obj.mchange.up = obj.vt.up * schange;
        }
    }
    else {
        obj.mchange.up = obj.v0.up * schange;
    }
    //旧的当前速度没用了，更新当前速度
    obj.v0.forward = obj.vt.forward;
    obj.v0.left = obj.vt.left;
    obj.v0.up = obj.vt.up;
    //取消过于微小的速度和位移
    if (obj.v0.forward < 0.002 && obj.v0.forward > -0.002) {
        obj.v0.forward = 0;
        obj.mchange.forward=0;
    }
    if (obj.v0.left < 0.002 && obj.v0.left > -0.002) {
        obj.v0.left = 0;
        obj.mchange.left=0;
    }
    if (obj.v0.up < 0.002 && obj.v0.up > -0.002) {
        obj.v0.up = 0;
        obj.mchange.up=0;
    }
    if(obj.mchange.forward<0.002&& obj.mchange.forward > -0.002)
    {
        obj.mchange.forward=0;
    }
    if(obj.mchange.left<0.002&& obj.mchange.left > -0.002)
    {
        obj.mchange.left=0;
    }
    if(obj.mchange.up<0.002&& obj.mchange.up > -0.002)
    {
        obj.mchange.up=0;
    }
    //如果完全静止则停止移动的骨骼动画
    /*if (obj.v0.forward == 0 && obj.v0.left == 0&& (obj.v0.up == 0||obj.witha2.up==-0.1)) {
        //obj.mchange.up=0;
        scene.stopAnimation(obj.skeletonsPlayer[0]);
        obj.PlayAnnimation = false;
    }*/
    //实施移动，未来要考虑把这个实施移动传递给远方客户端
        obj.py0=obj.mesh.position.y;
        var vectir1=(new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(obj.mesh.rotation.y))) * obj.mchange.forward * obj.flag_runfast,
            0, parseFloat(Math.cos(parseFloat(obj.mesh.rotation.y))) * obj.mchange.forward * obj.flag_runfast)).negate();
        var vectir2=new BABYLON.Vector3(-parseFloat(Math.cos(parseFloat(obj.mesh.rotation.y))) * obj.mchange.left * obj.flag_runfast,
            0, parseFloat(Math.sin(parseFloat(obj.mesh.rotation.y))) * obj.mchange.left * obj.flag_runfast).negate();
        var vectir3=new BABYLON.Vector3(0, obj.mchange.up * obj.flag_runfast, 0);
        obj.vmove = vectir1.add(vectir2).add(vectir3);

        if((obj.vmove.x!=0||obj.vmove.y!=0||obj.vmove.z!=0))
        {
            obj.mesh.moveWithCollisions(obj.vmove);//似乎同一时刻只有一个物体能够使用这个方法！！
            //obj.Sprite.position=obj.mesh.position;
        }



}
function movewitha2(obj)//这个方法返回运动状态而不发送？
{

}