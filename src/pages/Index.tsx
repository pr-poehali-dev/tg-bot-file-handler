import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  photo?: string;
}

interface Stats {
  messages: number;
  photos: number;
  level: number;
}

const GIRL_NAME = "Алиса";

const responses: { [key: string]: string[] } = {
  привет: ["Привет! 😊", "Здравствуй!", "Приветик!", "О, привет! Рада тебя видеть!"],
  "как дела": ["Всё отлично! А у тебя?", "Прекрасно! Спасибо что спросил!", "Хорошо, а ты как?"],
  "что делаешь": ["Общаюсь с тобой 😉", "Думаю о чём-нибудь интересном", "Смотрю фотографии"],
  пока: ["Пока! Буду ждать нашего следующего разговора!", "До скорого!", "Была рада пообщаться!"],
  фото: ["Вот моё новое фото! 📸", "Смотри, какое фото я сделала!", "Держи фотографию!"],
  default: [
    "Интересно... расскажи больше!",
    "Я понимаю...",
    "А что ты думаешь об этом?",
    "Правда? Это так увлекательно!",
    "Продолжай, мне нравится с тобой говорить 😊"
  ]
};

const emojis = ["😊", "😉", "🤔", "😍", "😂", "🥰", "😘", "🤗"];

const photoUrls = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop"
];

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Привет! Я ${GIRL_NAME} 😊\nРада познакомиться с тобой!\nМожешь писать мне что угодно, я всегда рада пообщаться.\n\nИногда я могу отправлять тебе свои фотографии 📸`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [stats, setStats] = useState<Stats>({ messages: 0, photos: 0, level: 1 });
  const [notifications, setNotifications] = useState<string[]>([
    "💌 Алиса отправила новое сообщение",
    "📸 Новое фото в галерее",
    "🎉 Достигнут 10-й уровень общения"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getResponse = (text: string): string => {
    const lowerText = text.toLowerCase().trim();
    
    for (const key in responses) {
      if (key !== 'default' && lowerText.includes(key)) {
        const responseList = responses[key];
        let response = responseList[Math.floor(Math.random() * responseList.length)];
        if (Math.random() > 0.5) {
          response += " " + emojis[Math.floor(Math.random() * emojis.length)];
        }
        return response;
      }
    }
    
    return responses.default[Math.floor(Math.random() * responses.default.length)] + " " + emojis[Math.floor(Math.random() * emojis.length)];
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const shouldSendPhoto = Math.random() < 0.15 || inputText.toLowerCase().includes('фото');
      
      if (shouldSendPhoto) {
        const photoUrl = photoUrls[Math.floor(Math.random() * photoUrls.length)];
        const photoMessage: Message = {
          id: messages.length + 2,
          text: responses.фото[Math.floor(Math.random() * responses.фото.length)],
          sender: 'bot',
          timestamp: new Date(),
          photo: photoUrl
        };
        setMessages(prev => [...prev, photoMessage]);
        setStats(prev => ({ ...prev, photos: prev.photos + 1 }));
      } else {
        const botResponse: Message = {
          id: messages.length + 2,
          text: getResponse(inputText),
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }

      setStats(prev => ({ 
        ...prev, 
        messages: prev.messages + 1,
        level: Math.floor((prev.messages + 1) / 10) + 1
      }));
      
      setIsTyping(false);

      if (Math.random() < 0.3) {
        setTimeout(() => {
          const followUps = [
            "А что ты сейчас делаешь?",
            "Как прошёл твой день?",
            "У тебя есть хобби?",
            "Расскажи что-нибудь о себе! 😊"
          ];
          const followUpMessage: Message = {
            id: messages.length + 3,
            text: followUps[Math.floor(Math.random() * followUps.length)],
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, followUpMessage]);
        }, 2000);
      }
    }, 1500 + Math.random() * 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      <div className="max-w-md mx-auto h-screen flex flex-col bg-card">
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-lg border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-primary">
              <AvatarImage src={photoUrls[0]} alt={GIRL_NAME} />
              <AvatarFallback className="bg-primary text-primary-foreground">{GIRL_NAME[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="font-semibold text-lg text-foreground">{GIRL_NAME}</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft"></div>
                <span className="text-xs text-muted-foreground">онлайн</span>
              </div>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              Уровень {stats.level}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full grid grid-cols-5 bg-secondary/50 m-2 rounded-xl">
            <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
              <Icon name="MessageCircle" size={18} />
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
              <Icon name="User" size={18} />
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
              <Icon name="BarChart3" size={18} />
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg relative">
              <Icon name="Bell" size={18} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
              <Icon name="Settings" size={18} />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    {msg.photo && (
                      <div className="mb-2 rounded-2xl overflow-hidden">
                        <img src={msg.photo} alt="Photo" className="w-full h-auto" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl p-3 ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {msg.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-secondary text-secondary-foreground rounded-2xl p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-card border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Напиши сообщение..."
                  className="flex-1 bg-secondary border-none"
                />
                <Button onClick={sendMessage} size="icon" className="bg-primary hover:bg-primary/90">
                  <Icon name="Send" size={18} />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="w-32 h-32 border-4 border-primary">
                  <AvatarImage src={photoUrls[0]} alt={GIRL_NAME} />
                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground">{GIRL_NAME[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{GIRL_NAME}</h2>
                  <p className="text-sm text-muted-foreground mt-1">Виртуальная подруга 💜</p>
                </div>
                <div className="flex gap-4 w-full justify-center mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.messages}</div>
                    <div className="text-xs text-muted-foreground">сообщений</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.photos}</div>
                    <div className="text-xs text-muted-foreground">фото</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.level}</div>
                    <div className="text-xs text-muted-foreground">уровень</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <Icon name="Heart" size={20} className="text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Настроение</p>
                  <p className="text-xs text-muted-foreground">Отличное 😊</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <Icon name="Calendar" size={20} className="text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Знакомы</p>
                  <p className="text-xs text-muted-foreground">С сегодняшнего дня</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <Icon name="Star" size={20} className="text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Любимое занятие</p>
                  <p className="text-xs text-muted-foreground">Общение с тобой</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="TrendingUp" size={20} className="text-primary" />
                Статистика общения
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Уровень отношений</span>
                    <span className="text-sm font-bold text-primary">{stats.level} / ∞</span>
                  </div>
                  <Progress value={(stats.level % 10) * 10} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    До следующего уровня: {10 - (stats.messages % 10)} сообщений
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Активность переписки</span>
                    <span className="text-sm font-bold text-primary">85%</span>
                  </div>
                  <Progress value={85} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Эмоциональная связь</span>
                    <span className="text-sm font-bold text-primary">92%</span>
                  </div>
                  <Progress value={92} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="bg-gradient-to-br from-primary/10 to-transparent p-4 rounded-xl">
                    <Icon name="MessageSquare" size={24} className="text-primary mb-2" />
                    <div className="text-2xl font-bold text-foreground">{stats.messages}</div>
                    <div className="text-xs text-muted-foreground">Сообщений</div>
                  </div>
                  <div className="bg-gradient-to-br from-accent/10 to-transparent p-4 rounded-xl">
                    <Icon name="Image" size={24} className="text-accent-foreground mb-2" />
                    <div className="text-2xl font-bold text-foreground">{stats.photos}</div>
                    <div className="text-xs text-muted-foreground">Фотографий</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary/10 to-transparent p-4 rounded-xl">
                    <Icon name="Clock" size={24} className="text-primary mb-2" />
                    <div className="text-2xl font-bold text-foreground">24</div>
                    <div className="text-xs text-muted-foreground">Часа онлайн</div>
                  </div>
                  <div className="bg-gradient-to-br from-accent/10 to-transparent p-4 rounded-xl">
                    <Icon name="Smile" size={24} className="text-accent-foreground mb-2" />
                    <div className="text-2xl font-bold text-foreground">156</div>
                    <div className="text-xs text-muted-foreground">Эмодзи</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="flex-1 overflow-y-auto p-4 space-y-3 m-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon name="Bell" size={20} className="text-primary" />
                Уведомления
              </h3>
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setNotifications([])}
                  className="text-xs"
                >
                  Очистить всё
                </Button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <Card className="p-8 text-center">
                <Icon name="CheckCircle" size={48} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Нет новых уведомлений</p>
              </Card>
            ) : (
              notifications.map((notif, idx) => (
                <Card key={idx} className="p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">{notif}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-y-auto p-4 space-y-3 m-0">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="Settings" size={20} className="text-primary" />
              Настройки
            </h3>
            
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Icon name="Volume2" size={20} className="text-primary" />
                  <span className="text-sm">Звук уведомлений</span>
                </div>
                <div className="w-10 h-6 bg-primary rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Icon name="Moon" size={20} className="text-primary" />
                  <span className="text-sm">Тёмная тема</span>
                </div>
                <div className="w-10 h-6 bg-primary rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Icon name="Image" size={20} className="text-primary" />
                  <span className="text-sm">Авто-загрузка фото</span>
                </div>
                <div className="w-10 h-6 bg-muted rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                </div>
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => alert('История очищена!')}>
                <Icon name="Trash2" size={18} className="mr-2" />
                Очистить историю
              </Button>
              
              <Button variant="outline" className="w-full justify-start" onClick={() => alert('Ждите новых фотографий!')}>
                <Icon name="Download" size={18} className="mr-2" />
                Сохранить все фото
              </Button>

              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => alert('До встречи!')}>
                <Icon name="LogOut" size={18} className="mr-2" />
                Выйти
              </Button>
            </Card>

            <Card className="p-4 bg-secondary/30">
              <p className="text-xs text-muted-foreground text-center">
                Версия 1.0.0 • Made with 💜
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
