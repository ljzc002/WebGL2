/**
 * Created by lz on 2016/10/4.
 */
    //不与3D运动直接相关的工具库
var deepCopy= function(source) {//深复制，有报错？
    var result={};
    for (var key in source) {
        result[key] = typeof source[key]==='object'? deepCopy(source[key]): source[key];
    }
    return result;
}

//把文字转变为图片jpeg
function texttoimg(str)
{
    var c=document.createElement("canvas");
    c.height=20;
    c.width=100;
    var context = c.getContext('2d');
    context.font="normal 15px sans-serif";
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle="rgb(255,255,255)";
    context.fillRect(0,0,canvas.width,canvas.height);
    context.fillStyle = "rgb(0,0,0)";
    context.textBaseline = 'top';
    context.fillText(str,(c.width-str.length*15)/2,0, c.width*0.9);
    var str_src=c.toDataURL("image/jpeg");
    return str_src;
    //return c;
}
//把文字转变为图片PNG
function texttoimg2(str)
{
    var c=document.createElement("canvas");
    c.height=20;
    c.width=100;
    var context = c.getContext('2d');
    context.font="normal 20px sans-serif";
    context.clearRect(0, 0, canvas.width, canvas.height);
    //context.fillStyle="rgb(255,255,255)";
    //context.fillRect(0,0,canvas.width,canvas.height);
    context.fillStyle = "rgb(255,255,255)";
    context.textBaseline = 'middle';//
    context.fillText(str,(c.width-str.length*20)/2,10, c.width*0.9);
    var str_src=c.toDataURL("image/png");
    return str_src;
    //return c;
}