import json
import os
import random
from typing import Dict, Any, List

GIRL_NAME = "Алиса"

responses: Dict[str, List[str]] = {
    "привет": ["Привет! 😊", "Здравствуй!", "Приветик!", "О, привет! Рада тебя видеть!"],
    "как дела": ["Всё отлично! А у тебя?", "Прекрасно! Спасибо что спросил!", "Хорошо, а ты как?"],
    "что делаешь": ["Общаюсь с тобой 😉", "Думаю о чём-нибудь интересном", "Смотрю фотографии"],
    "пока": ["Пока! Буду ждать нашего следующего разговора!", "До скорого!", "Была рада пообщаться!"],
    "фото": ["Вот моё новое фото! 📸", "Смотри, какое фото я сделала!", "Держи фотографию!"],
    "default": [
        "Интересно... расскажи больше!",
        "Я понимаю...",
        "А что ты думаешь об этом?",
        "Правда? Это так увлекательно!",
        "Продолжай, мне нравится с тобой говорить 😊"
    ]
}

emojis = ["😊", "😉", "🤔", "😍", "😂", "🥰", "😘", "🤗"]

photo_urls = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1200&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1200&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1200&fit=crop",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1200&fit=crop"
]

def get_response(text: str) -> str:
    """Получение ответа на основе текста сообщения"""
    lower_text = text.lower().strip()
    
    for key, response_list in responses.items():
        if key != "default" and key in lower_text:
            response = random.choice(response_list)
            if random.random() > 0.5:
                response += " " + random.choice(emojis)
            return response
    
    return random.choice(responses["default"]) + " " + random.choice(emojis)

def send_message(chat_id: int, text: str, bot_token: str) -> None:
    """Отправка текстового сообщения"""
    import urllib.request
    import urllib.parse
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }).encode()
    
    urllib.request.urlopen(url, data=data)

def send_photo(chat_id: int, photo_url: str, caption: str, bot_token: str) -> None:
    """Отправка фотографии"""
    import urllib.request
    import urllib.parse
    
    url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'photo': photo_url,
        'caption': caption
    }).encode()
    
    urllib.request.urlopen(url, data=data)

def send_chat_action(chat_id: int, action: str, bot_token: str) -> None:
    """Отправка действия (typing, upload_photo)"""
    import urllib.request
    import urllib.parse
    
    url = f"https://api.telegram.org/bot{bot_token}/sendChatAction"
    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'action': action
    }).encode()
    
    try:
        urllib.request.urlopen(url, data=data)
    except:
        pass

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Telegram бот с виртуальной девушкой Алисой
    Обрабатывает webhook от Telegram и отвечает на сообщения
    """
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not bot_token:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Bot token not configured'}),
            'isBase64Encoded': False
        }
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'status': 'Bot is running',
                'bot_name': GIRL_NAME
            }),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        if 'message' not in body:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        message = body['message']
        chat_id = message['chat']['id']
        text = message.get('text', '')
        
        if text.startswith('/start'):
            send_chat_action(chat_id, 'typing', bot_token)
            welcome_text = (
                f"Привет! Я {GIRL_NAME} 😊\n"
                f"Рада познакомиться с тобой!\n"
                f"Можешь писать мне что угодно, я всегда рада пообщаться.\n\n"
                f"Иногда я могу отправлять тебе свои фотографии 📸\n"
                f"Просто напиши 'фото' или попроси об этом!"
            )
            send_message(chat_id, welcome_text, bot_token)
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        should_send_photo = random.random() < 0.15 or 'фото' in text.lower()
        
        if should_send_photo:
            send_chat_action(chat_id, 'upload_photo', bot_token)
            photo_url = random.choice(photo_urls)
            caption = random.choice(responses['фото']) + " " + random.choice(emojis)
            send_photo(chat_id, photo_url, caption, bot_token)
        else:
            send_chat_action(chat_id, 'typing', bot_token)
            response_text = get_response(text)
            send_message(chat_id, response_text, bot_token)
            
            if random.random() < 0.3:
                follow_ups = [
                    "А что ты сейчас делаешь?",
                    "Как прошёл твой день?",
                    "У тебя есть хобби?",
                    "Расскажи что-нибудь о себе! 😊"
                ]
                send_chat_action(chat_id, 'typing', bot_token)
                follow_up = random.choice(follow_ups)
                send_message(chat_id, follow_up, bot_token)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'error': str(e)}),
            'isBase64Encoded': False
        }
