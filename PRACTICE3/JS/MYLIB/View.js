/**
 * Created by Administrator on 2015/5/8.
 */
//防止在不可编辑但可获得焦点的标签上按退格导致浏览器返回上一网页
document.onkeydown = function()
{
    // 如果按下的是退格键
    if(event.keyCode == 8) {
        // 如果是在textarea内不执行任何操作
        if(event.srcElement.tagName.toLowerCase() != "input"  && event.srcElement.tagName.toLowerCase() != "textarea" && event.srcElement.tagName.toLowerCase() != "password")
            cancelEvent(event);
            //event.returnValue = false;
        // 如果是readOnly或者disable不执行任何操作
        if(event.srcElement.readOnly == true || event.srcElement.disabled == true)
            cancelEvent(event);
            //event.returnValue = false;
    }
}
//返回屏幕的宽度和高度
function screen_size()
{
    var wdth=0;
    var hth=0;
    wdth=window.screen.availWidth;
    hth=window.screen.availHeight;
    return {width:wdth,height:hth};
}
//返回web页面的视口宽度和高度
function window_size()
{
    var wdth=0;
    var hth=0;
    if(!window.innerWidth)
    {
        wdth=(document.documentElement.clientWidth?document.documentElement.clientWidth:document.body.clientWidth);
        hth=(document.documentElement.clientHeight?document.documentElement.clientHeight:document.body.clientHeight);
    }
    else
    {
        wdth=window.innerWidth;
        hth=window.innerHeight;
    }
    return {width:wdth,height:hth};
}
//度量元素高度
function elem_size(id)
{
    var wdth=0;
    var hth=0;
    var rect=document.getElementById(id).getBoundingClientRect();
    if(rect.height)
    {
        wdth=rect.width;
        hth=rect.height;
    }
    else
    {
        wdth=rect.right-rect.left;
        hth=rect.bottom-rect.top;
    }
    return {width:wdth,height:hth};
}
//只使用ID方式是由局限性的！!
//取元素的左下角位置
function compPos(id)
{
    var rect=document.getElementById(id).getBoundingClientRect();
    var height;
    if(rect.height)
    {
        height=rect.height;
    }else
    {
        height=rect.bottom-rect.top;
    }
    var top=rect.top+height+0;
    return {left:rect.left,top:top};
}
function compPos2(obj)
{
    var rect=obj.getBoundingClientRect();
    var height;
    if(rect.height)
    {
        height=rect.height;
    }else
    {
        height=rect.bottom-rect.top;
    }
    var top=rect.top+height+0;
    return {left:rect.left,top:top};
}
//以did为id在sid物体的下面打开一个div
//目标物体：要添加的物体，源物体：目标物体相对于源物体左下角定位，容器：目标物体被加在容器的标签内
//源物体id、目标物体id，目标物体的宽高，偏移源物体xy坐标，源物体的对象，目标物体加入的容器（默认为body）,是否要加上全屏遮罩（1表示是，默认为零）
//有一个新版本在笔记本里
function Open_div(sid,did,width,height,x,y,obj,inid,isms)
{
    //evt=evt?evt:window.event;
    if(!width)
    {
        width=120;
    }
    if(!height)
    {
        height=40;
    }
    if(!x)
    {
        x=0;
    }
    if(!y)
    {
        y=0;
    }
    var div =document.createElement("div");
    div.id=did;
    if(sid!="") {//如果有id
        var pos = compPos(sid);
    }
    else//如果没有id，直接使用obj
    {
        var pos = compPos2(obj);
    }

    div.style.width=width+"px";
    div.style.height=height+"px";
    div.style.position="absolute"
    div.style.zIndex=350;
    div.style.backgroundColor="#ffffff";
    div.style.imeMode="disabled";
    if(isms==1)//加入遮罩层
    {
        var div2 =document.createElement("div");
        //div.style.width="100px";
        //div.style.height="100px";
        div2.className="div_mask";
        div2.id="div_mask";
        document.body.appendChild(div2);
    }
    //添加弹出框
    if(inid==""||inid==null) {
        div.style.top=pos.top+y+"px";
        div.style.left=pos.left+x+"px";
        document.body.appendChild(div);
    }
    else
    {//自动判断inid是id还是obj
        if(inid.tagName==undefined)
        {
            var inobj = document.getElementById(inid);
        }
        else
        {
            var inobj=inid;
        }
        var inposx=inobj.getBoundingClientRect().left;
        var inposy=inobj.getBoundingClientRect().top;//
        //要想让弹出框随着另一物体移动，可以把弹出框作为这个物体的子物体
        //这种情况下的弹出框定位要使用屏幕位置减去父物体相对屏幕位置的位移得到弹出框相对于父物体的位置
        div.style.top=pos.top+y-inposy+inobj.scrollTop+"px";
        div.style.left=pos.left+x-inposx+inobj.scrollLeft+"px";
        inobj.appendChild(div);
    }

}
//删除一个标签
function delete_div(id)
{
    var obj=document.getElementById(id);
    if(obj)
    {
        obj.parentNode.removeChild(obj);
    }
}
//把一个标签清空
function clean_div(id)
{
    var obj=document.getElementById(id);
    if(obj)
    {
        obj.innerHTML="";
    }
}
//设置一个标签的内容
function set_div(id,content)
{
    var obj=document.getElementById(id);
    if(obj)
    {
        obj.innerHTML=content;
    }
}
//将触发事件的元素的内容改变
function SetSelf(str)
{
    var evt=evt||window.event;
    cancelPropagation(evt);
    var obj=evt.currentTarget?evt.currentTarget:evt.srcElement;
    obj.innerHTML=str;
}
//将一类标签（按钮）设为可用状态
function EnableClass(classname)
{
    var objs=con_getElementsByClassName(classname);
    var len =objs.length;
    for(var i=0;i<len;i++)
    {
        objs[i].disabled="false";
    }
}
function DisableClass(classname)
{
    var objs=con_getElementsByClassName(classname);
    var len =objs.length;
    for(var i=0;i<len;i++)
    {
        objs[i].disabled="true";
    }
}
//从网上找的div拖动代码，对他进行修改使得只有头部可以被拖拽
//事实上“按下”是“单击”的前半部分，所以按下的事件响应发生在单击之前，可能会把单击的响应给阻碍掉！！！！
//这种阻碍是时间顺序，而事件冒泡的阻碍是空间顺序！！
function drag(oDrag) {
    var disX = dixY = 0;
    oDrag.onmousedown = function(event) {
        var event = event || window.event;
        //cancelPropagation(event);
        /*var obj=event.currentTarget?event.currentTarget:event.srcElement;
        if(obj.tagName=="button"||obj.tagName=="BUTTON")
        {
            return false;//这样相当于这一次的事件链被完全放弃
        }*/
        disX = event.clientX - this.offsetLeft;
        disY = event.clientY - this.offsetTop;

        var oTemp = this.cloneNode(true);
        document.body.appendChild(oTemp);

        document.onmousemove = function(event) {
            var event = event || window.event;
            var iL = event.clientX - disX;
            var iT = event.clientY - disY;
            var maxL = document.documentElement.clientWidth - oDrag.offsetWidth;
            var maxT = document.documentElement.clientHeight - oDrag.offsetHeight;

            iL <= 0 && (iL = 0);
            iT <= 0 && (iT = 0);
            iL >= maxL && (iL = maxL);
            iT >= maxT && (iT = maxT);
            oTemp.style.zIndex = zIndex++;
            oTemp.style.opacity = "0.5";
            oTemp.style.filter = "alpha(opacity=50)";
            oTemp.style.left = iL + "px";
            oTemp.style.top = iT + "px";
            return false;
        };

        document.onmouseup = function() {
            document.onmousemove = null;
            document.onmouseup = null;
            //oDrag.style.opacity = oTemp.style.opacity;
            var arr = {
                left: oTemp.offsetLeft,
                top: oTemp.offsetTop
            };
            oDrag.style.zIndex = oTemp.style.zIndex;
            oAnimate(oDrag, arr, 300,
                function() {
                    document.body.removeChild(oTemp);
                });
            oDrag.releaseCapture && oDrag.releaseCapture()
        };

        this.setCapture && this.setCapture();
        return false
    }
}
function oAnimate(obj, params, time, handler) {
    var node = typeof obj == "string" ? $(obj) : obj;
    var _style = node.currentStyle ? node.currentStyle: window.getComputedStyle(node, null);
    var handleFlag = true;
    for (var p in params) { (function() {
        var n = p;
        if (n == "left" || n == "top") {
            var _old = parseInt(_style[n]);
            var _new = parseInt(params[n]);
            var _length = 0,
                _tt = 10;
            if (!isNaN(_old)) {
                var count = _old;
                var length = _old <= _new ? (_new - _old) : (_old - _new);
                var speed = length / time * _tt;
                var flag = 0;
                var anim = setInterval(function() {
                        node.style[n] = count + "px";
                        count = _old <= _new ? count + speed: count - speed;
                        flag += _tt;
                        if (flag >= time) {
                            node.style[n] = _new + "px";
                            clearInterval(anim);
                            if (handleFlag) {
                                handler();
                                handleFlag = false;
                            }
                        }
                    },
                    _tt);
            }

        }
    })();
    }
}
//用一个数组填充一个select标签，依赖jquery选择器
function ArrFillSelect(arr,select)
{
    select.innerHTML="";
    var len=arr.length;
    option=document.createElement("option");//插入一个空项
    select.appendChild(option);
    for(var i=0;i<len;i++)
    {
        var option=document.createElement("option");
        option.innerHTML=arr[i][1];
        option.value=arr[i][0];
        select.appendChild(option);
    }
}
//根据文本和值返回select中被选中的索引
function FindSelectedIndex(select,text)
{
    var options=select.getElementsByTagName("option");
    var len=options.length;
    //优先考虑文本
    for(var i=0;i<len;i++)
    {
        if(options[i].innerHTML==text)
        {
            return i;
        }
    }
    //再考虑值
    for(var i=0;i<len;i++)
    {
        if(options[i].value==text)
        {
            return i;
        }
    }
    return -1;//表示不存在
}
