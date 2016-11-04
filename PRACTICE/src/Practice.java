

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
        webSocketSet.add(this);     //����set��
        addOnlineCount();           //��������1
        //System.out.println("�������Ӽ��룡��ǰ��������Ϊ" + getOnlineCount());
        try 
        {
			this.sendMessage("@id:"+this.session.getId());//���id�ǰ�������������ģ����Ա����ظ�
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
		if(this.id.equals(Practice.admin))//�����admin������
		{
			webSocketSet.remove(this);  //��set��ɾ��
	        subOnlineCount();           //��������1
	        if(webSocketSet.size()>0)
	        {
	        	int i=0;
	        	for(Practice item: webSocketSet)
	            { //��ѡʣ������е���һ�������Ϊadmin
	        		if(i==0)
	        		{
	        			i++;
	        			item.name="admin";
	        			Practice.admin=item.id;
	        			try {
							item.sendMessage("@name:admin");//����
						} catch (IOException e) {
							e.printStackTrace();
						}
	        		}
	        		
	            }
	        }
	        else
	        {
	        	Practice.admin="";//���������û��������ˣ������������
	        }
		}
		else
		{
			webSocketSet.remove(this);  //��set��ɾ��
	        subOnlineCount();           //��������1
		}
		
        //System.out.println("��һ���ӹرգ���ǰ��������Ϊ" + getOnlineCount());
    }
	@OnMessage
    public void onMessage(String message, Session session) 
	{
        //System.out.println("���Կͻ��˵���Ϣ:" + message);
        if((message.length()>6)&&(message.substring(0,6).equals("@name:")))//�����������Ϣ//���message����6��Ȼ�ᱨ����
        {
        	String str_name=message.split(":")[1];	
        	if(str_name.equals("admin"))//��������ҵĽ�ɫ��admin
        	{
        		if(Practice.admin.equals(""))
        		{//�����û��admin
        			this.name=str_name;
        			Practice.admin=this.id;
        			try {
						this.sendMessage("@name:admin");//����
					} catch (IOException e) {
						e.printStackTrace();
					}
        		}
        		else
        		{//����Ѿ�����admin
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
        {//˽����Ϣ
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
        {//��adminserver������server�㲥����Ϣ
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
        	//�㲥��Ϣ���������Լ�
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
        System.out.println("�������󣬹ر�����");
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
        if(this.id.equals(Practice.admin))//�����admin������
		{
			webSocketSet.remove(this);  //��set��ɾ��
	        subOnlineCount();           //��������1
	        if(webSocketSet.size()>0)
	        {
	        	int i=0;
	        	for(Practice item: webSocketSet)
	            { //��ѡʣ������е���һ�������Ϊadmin
	        		if(i==0)
	        		{
	        			i++;
	        			item.name="admin";
	        			Practice.admin=item.id;
	        		}
	        		try {
						item.sendMessage("@name:admin");//����
					} catch (IOException e) {
						e.printStackTrace();
					}
	            }
	        }
	        else
	        {
	        	Practice.admin="";//���������û��������ˣ������������
	        }
		}
		else
		{
			webSocketSet.remove(this);  //��set��ɾ��
	        subOnlineCount();           //��������1
		}
        //webSocketSet.remove(this);
        //subOnlineCount(); 
        error.printStackTrace();
    }
	public synchronized void sendMessage(String message) throws IOException{//��Ϊͬ�������ķ��ͷ�ʽ��������
        this.session.getBasicRemote().sendText(message);
        Date dt=new Date();
        //System.out.println(dt.getTime()+"==>>"+message);
        //this.session.getAsyncRemote().sendText(message);
    }
	public void sendMessage2(String message) throws IOException{//��Ϊ�첽�������ķ��ͷ�ʽ��������
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
