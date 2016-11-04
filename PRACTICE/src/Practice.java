

import java.io.IOException;
import java.util.Date;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint("/websocket3")
public class Practice {
	private static int onlineCount = 0;
	private static CopyOnWriteArraySet<Practice> webSocketSet = new CopyOnWriteArraySet<Practice>();
	private static String admin="";
	private Session session;
	private String name="";
	private String id="";
	@OnOpen
    public void onOpen(Session session)
	{
        this.session = session;
        webSocketSet.add(this);     //加入set中
        addOnlineCount();           //在线数加1
        //System.out.println("有新连接加入！当前在线人数为" + getOnlineCount());
        try 
        {
			this.sendMessage("@id:"+this.session.getId());//这个id是按总连接数来算的，可以避免重复
			this.id=this.session.getId();
		} catch (IOException e) {
			e.printStackTrace();
		}
        for(Practice item: webSocketSet)
        {   
        	if(!item.id.equals(this.id))
        	{
            	try {
                    item.sendMessage("[getonl]"+this.id);
                } catch (IOException e) {
                    e.printStackTrace();
                    continue;
                }
        	}
        }
    }
	@OnClose
    public void onClose()
	{
		for(Practice item: webSocketSet)
        {   
        	if(!item.id.equals(this.id))
        	{
            	try {
                    item.sendMessage("[getoff]"+this.id);
                } catch (IOException e) {
                    e.printStackTrace();
                    continue;
                }
        	}
        }
		if(this.id.equals(Practice.admin))//如果是admin下线了
		{
			webSocketSet.remove(this);  //从set中删除
	        subOnlineCount();           //在线数减1
	        if(webSocketSet.size()>0)
	        {
	        	int i=0;
	        	for(Practice item: webSocketSet)
	            { //挑选剩余队列中的下一个玩家作为admin
	        		if(i==0)
	        		{
	        			i++;
	        			item.name="admin";
	        			Practice.admin=item.id;
	        			try {
							item.sendMessage("@name:admin");//任命
						} catch (IOException e) {
							e.printStackTrace();
						}
	        		}
	        		
	            }
	        }
	        else
	        {
	        	Practice.admin="";//可能所有用户都下线了，但这个服务还在
	        }
		}
		else
		{
			webSocketSet.remove(this);  //从set中删除
	        subOnlineCount();           //在线数减1
		}
		
        //System.out.println("有一连接关闭！当前在线人数为" + getOnlineCount());
    }
	@OnMessage
    public void onMessage(String message, Session session) 
	{
        //System.out.println("来自客户端的消息:" + message);
        if((message.length()>6)&&(message.substring(0,6).equals("@name:")))//这个是命名信息//如果message不足6竟然会报错！！
        {
        	String str_name=message.split(":")[1];	
        	if(str_name.equals("admin"))//如果这个玩家的角色是admin
        	{
        		if(Practice.admin.equals(""))
        		{//如果还没有admin
        			this.name=str_name;
        			Practice.admin=this.id;
        			try {
						this.sendMessage("@name:admin");//任命
					} catch (IOException e) {
						e.printStackTrace();
					}
        		}
        		else
        		{//如果已经有了admin
        			this.name=this.id;
        			try {
						this.sendMessage("@name:"+this.session.getId());
					} catch (IOException e) {
						e.printStackTrace();
					}
        		}
        	}
        }
        else if((message.length()>6)&&(message.substring(0,7).equals("privat:")))
        {//私聊信息
        	for(Practice item: webSocketSet)
            { 
        		if(item.id.equals(message.split("#")[0].split(":")[1]))
        		{
        			try {
	                    item.sendMessage(this.id+"@"+message.split("#")[1]);
	                } catch (IOException e) {
	                    e.printStackTrace();
	                    continue;
	                }
        			break;
        		}
            }        	
        }
        else if((message.length()>6)&&(message.substring(0,8).equals("[admins]"))&&this.name.equals("admin"))
        {//由adminserver向其他server广播的信息
        	for(Practice item: webSocketSet)
            {   
            	if(!item.id.equals(this.id))
            	{
	            	try {
	                    item.sendMessage(message);
	                } catch (IOException e) {
	                    e.printStackTrace();
	                    continue;
	                }
            	}
            }        	
        }
        else
        {
        	//广播信息，不发给自己
            for(Practice item: webSocketSet)
            {   
            	if(!item.id.equals(this.id))
            	{
	            	try {
	                    item.sendMessage(this.id+"@"+message);
	                } catch (IOException e) {
	                    e.printStackTrace();
	                    continue;
	                }
            	}
            }
        }               
    }
	@OnError
    public void onError(Session session, Throwable error){
        System.out.println("发生错误，关闭连接");
        for(Practice item: webSocketSet)
        {   
        	if(!item.id.equals(this.id))
        	{
            	try {
                    item.sendMessage("[geterr]"+this.id);
                } catch (IOException e) {
                    e.printStackTrace();
                    continue;
                }
        	}
        }
        if(this.id.equals(Practice.admin))//如果是admin下线了
		{
			webSocketSet.remove(this);  //从set中删除
	        subOnlineCount();           //在线数减1
	        if(webSocketSet.size()>0)
	        {
	        	int i=0;
	        	for(Practice item: webSocketSet)
	            { //挑选剩余队列中的下一个玩家作为admin
	        		if(i==0)
	        		{
	        			i++;
	        			item.name="admin";
	        			Practice.admin=item.id;
	        		}
	        		try {
						item.sendMessage("@name:admin");//任命
					} catch (IOException e) {
						e.printStackTrace();
					}
	            }
	        }
	        else
	        {
	        	Practice.admin="";//可能所有用户都下线了，但这个服务还在
	        }
		}
		else
		{
			webSocketSet.remove(this);  //从set中删除
	        subOnlineCount();           //在线数减1
		}
        //webSocketSet.remove(this);
        //subOnlineCount(); 
        error.printStackTrace();
    }
	public synchronized void sendMessage(String message) throws IOException{//此为同步阻塞的发送方式（单发）
        this.session.getBasicRemote().sendText(message);
        Date dt=new Date();
        //System.out.println(dt.getTime()+"==>>"+message);
        //this.session.getAsyncRemote().sendText(message);
    }
	public void sendMessage2(String message) throws IOException{//此为异步非阻塞的发送方式（单发）
        this.session.getAsyncRemote ().sendText(message);
        Date dt=new Date();
        //System.out.println(dt.getTime()+"==>>"+message);
        //this.session.getAsyncRemote().sendText(message);
    }
	
    public static synchronized int getOnlineCount() {
        return onlineCount;
    }
    public static synchronized void addOnlineCount() {
    	Practice.onlineCount++;
    }
    public static synchronized void subOnlineCount() {
    	Practice.onlineCount--;
    }
}
