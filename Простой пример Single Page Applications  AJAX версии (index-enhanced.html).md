Да, для расширенной версии нужно добавить `<script src="app-enhanced.js"></script>`. Вот полный пример:

## HTML для расширенной версии (index-enhanced.html)

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Улучшенное SPA</title>
    <style>
        nav { margin: 20px 0; padding: 10px; background: #f5f5f5; }
        nav a { margin: 0 15px; text-decoration: none; color: #333; padding: 5px 10px; }
        nav a:hover { background: #ddd; }
        nav a.active { background: #007bff; color: white; }
        #app-content { padding: 20px; border: 1px solid #ccc; min-height: 300px; }
        .loading { color: #666; font-style: italic; }
    </style>
</head>
<body>
    <h1>Улучшенное SPA приложение</h1>
    
    <nav>
        <a href="#home" data-page="home">Главная</a>
        <a href="#about" data-page="about">О нас</a>
        <a href="#contact" data-page="contact">Контакты</a>
        <a href="#products" data-page="products">Товары</a>
    </nav>
    
    <div id="app-content">
        <div class="loading">Загрузка...</div>
    </div>

    <!-- Подключаем расширенную версию -->
    <script src="app-enhanced.js"></script>
</body>
</html>
```

## JavaScript (app-enhanced.js)

```javascript
class EnhancedSPA {
    constructor() {
        this.pages = {
            'home': { 
                url: '#home', 
                title: 'Главная - Мое SPA',
                content: `
                    <h2>Добро пожаловать на главную!</h2>
                    <p>Это улучшенная версия SPA с динамической загрузкой контента.</p>
                    <button onclick="alert('Привет из SPA!')">Нажми меня</button>
                `
            },
            'about': { 
                url: '#about', 
                title: 'О нас - Мое SPA',
                content: `
                    <h2>О нашей компании</h2>
                    <p>Мы разрабатываем современные веб-приложения.</p>
                    <ul>
                        <li>SPA приложения</li>
                        <li>Мобильные приложения</li>
                        <li>Веб-сервисы</li>
                    </ul>
                `
            },
            'contact': { 
                url: '#contact', 
                title: 'Контакты - Мое SPA', 
                content: `
                    <h2>Наши контакты</h2>
                    <p><strong>Email:</strong> example@mail.com</p>
                    <p><strong>Телефон:</strong> +7 (999) 123-45-67</p>
                    <p><strong>Адрес:</strong> Москва, ул. Примерная, 123</p>
                `
            },
            'products': { 
                url: '#products', 
                title: 'Товары - Мое SPA',
                // Имитация загрузки с сервера
                content: this.loadProductsContent.bind(this)
            }
        };
        
        this.init();
    }
    
    async init() {
        this.setupNavigation();
        await this.loadInitialPage();
        this.setupHistory();
    }
    
    setupNavigation() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('nav a')) {
                e.preventDefault();
                const pageId = e.target.getAttribute('data-page');
                this.navigateTo(pageId);
            }
        });
    }
    
    async navigateTo(pageId) {
        if (this.pages[pageId]) {
            await this.renderPage(pageId);
            this.updateHistory(pageId);
        } else {
            await this.renderPage('home');
        }
    }
    
    async renderPage(pageId) {
        const page = this.pages[pageId];
        
        // Показываем индикатор загрузки
        this.showLoading();
        
        let content;
        
        // Если content - функция, вызываем её
        if (typeof page.content === 'function') {
            content = await page.content();
        } else {
            // Имитация загрузки с задержкой
            content = await new Promise(resolve => {
                setTimeout(() => resolve(page.content), 300);
            });
        }
        
        // Обновляем контент
        document.getElementById('app-content').innerHTML = content;
        document.title = page.title;
        
        this.updateActiveNav(pageId);
    }
    
    updateActiveNav(pageId) {
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.toggle('active', 
                link.getAttribute('data-page') === pageId);
        });
    }
    
    updateHistory(pageId) {
        const page = this.pages[pageId];
        window.history.pushState({ pageId }, page.title, page.url);
    }
    
    setupHistory() {
        window.addEventListener('popstate', (e) => {
            const pageId = e.state?.pageId || this.getCurrentPage() || 'home';
            this.renderPage(pageId);
        });
    }
    
    showLoading() {
        const contentElement = document.getElementById('app-content');
        contentElement.innerHTML = '<div class="loading">Загрузка...</div>';
    }
    
    async loadInitialPage() {
        const initialPage = this.getCurrentPage() || 'home';
        await this.renderPage(initialPage);
    }
    
    getCurrentPage() {
        const hash = window.location.hash.substring(1);
        return hash in this.pages ? hash : null;
    }
    
    // Метод для загрузки динамического контента
    async loadProductsContent() {
        // Имитация AJAX запроса к серверу
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(`
                    <h2>Наши товары</h2>
                    <div class="products">
                        <div class="product">
                            <h3>Ноутбук</h3>
                            <p>Мощный ноутбук для работы и игр</p>
                            <p><strong>Цена: 50 000 руб.</strong></p>
                        </div>
                        <div class="product">
                            <h3>Смартфон</h3>
                            <p>Современный смартфон с отличной камерой</p>
                            <p><strong>Цена: 25 000 руб.</strong></p>
                        </div>
                        <div class="product">
                            <h3>Планшет</h3>
                            <p>Легкий и производительный планшет</p>
                            <p><strong>Цена: 35 000 руб.</strong></p>
                        </div>
                    </div>
                    <style>
                        .products { display: grid; gap: 20px; margin-top: 20px; }
                        .product { padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                        .product h3 { margin-top: 0; color: #007bff; }
                    </style>
                `);
            }, 500);
        });
    }
    
    // Публичный метод для обновления контента
    updatePageContent(pageId, newContent) {
        if (this.pages[pageId]) {
            this.pages[pageId].content = newContent;
            if (this.getCurrentPage() === pageId) {
                this.renderPage(pageId);
            }
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EnhancedSPA();
});
```

## Разница между версиями:

### **Простая версия:**
- ✅ Статический HTML
- ✅ Базовая навигация по hash
- ✅ Простая логика переключения страниц
- ❌ Нет History API
- ❌ Нет динамической загрузки контента
- ❌ Нет управления заголовком страницы

### **Расширенная версия:**
- ✅ **History API** - правильная работа с историей браузера (кнопки вперед/назад)
- ✅ **Динамическая загрузка** - контент может подгружаться с сервера
- ✅ **Изменение title** - заголовок страницы обновляется
- ✅ **Индикатор загрузки** - показ состояния загрузки
- ✅ **Более гибкая архитектура** - легко добавлять новые страницы
- ✅ **AJAX поддержка** - загрузка данных с сервера
- ✅ **Публичные методы** - возможность обновлять контент извне

## Как подключить:

1. **Для простой версии:**
```html
<script src="app.js"></script>
```

2. **Для расширенной версии:**
```html
<script src="app-enhanced.js"></script>
```

**Расширенная версия лучше потому что:**
- Правильная работа с историей браузера
- Возможность SEO-оптимизации
- Лучшая производительность (ленивая загрузка)
- Более профессиональная архитектура
- Легкость в поддержке и расширении
