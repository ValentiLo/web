Вот простой пример Single Page Application (SPA) с использованием чистого JavaScript:

## HTML (index.html)
```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Простое SPA</title>
    <style>
        nav { margin: 20px 0; }
        nav a { margin: 0 10px; text-decoration: none; color: blue; }
        nav a:hover { text-decoration: underline; }
        .page { display: none; padding: 20px; border: 1px solid #ccc; }
        .active { display: block; }
    </style>
</head>
<body>
    <h1>Мое SPA приложение</h1>
    
    <nav>
        <a href="#home" data-page="home">Главная</a>
        <a href="#about" data-page="about">О нас</a>
        <a href="#contact" data-page="contact">Контакты</a>
    </nav>
    
    <div id="home" class="page active">
        <h2>Добро пожаловать!</h2>
        <p>Это главная страница нашего SPA приложения.</p>
    </div>
    
    <div id="about" class="page">
        <h2>О нас</h2>
        <p>Мы создаем простые и эффективные веб-приложения.</p>
    </div>
    
    <div id="contact" class="page">
        <h2>Контакты</h2>
        <p>Email: example@mail.com</p>
        <p>Телефон: +7 (999) 123-45-67</p>
    </div>

    <script src="app.js"></script>
</body>
</html>
```

## JavaScript (app.js)
```javascript
class SimpleSPA {
    constructor() {
        this.pages = document.querySelectorAll('.page');
        this.navLinks = document.querySelectorAll('nav a');
        this.currentPage = 'home';
        
        this.init();
    }
    
    init() {
        // Обработка кликов по навигации
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.getAttribute('data-page');
                this.showPage(pageId);
            });
        });
        
        // Обработка изменения hash в URL
        window.addEventListener('hashchange', () => {
            const pageId = this.getPageFromHash();
            this.showPage(pageId);
        });
        
        // Загрузка начальной страницы
        const initialPage = this.getPageFromHash() || 'home';
        this.showPage(initialPage);
    }
    
    getPageFromHash() {
        const hash = window.location.hash.substring(1);
        return hash || 'home';
    }
    
    showPage(pageId) {
        // Скрыть все страницы
        this.pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Показать выбранную страницу
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
            
            // Обновляем URL
            window.location.hash = pageId;
            
            // Обновляем активную ссылку в навигации
            this.updateActiveNavLink(pageId);
        }
    }
    
    updateActiveNavLink(pageId) {
        this.navLinks.forEach(link => {
            link.style.fontWeight = link.getAttribute('data-page') === pageId ? 'bold' : 'normal';
        });
    }
    
    // Метод для динамической загрузки контента
    loadContent(pageId, content) {
        const page = document.getElementById(pageId);
        if (page) {
            page.innerHTML = content;
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new SimpleSPA();
});
```

## Расширенная версия с AJAX загрузкой

```javascript
// app-enhanced.js
class EnhancedSPA {
    constructor() {
        this.pages = {
            'home': { 
                url: '#home', 
                title: 'Главная',
                content: '<h2>Добро пожаловать!</h2><p>Это главная страница.</p>'
            },
            'about': { 
                url: '#about', 
                title: 'О нас',
                content: '<h2>О нас</h2><p>Информация о компании.</p>'
            },
            'contact': { 
                url: '#contact', 
                title: 'Контакты',
                content: '<h2>Контакты</h2><p>Свяжитесь с нами.</p>'
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
        }
    }
    
    async renderPage(pageId) {
        const page = this.pages[pageId];
        
        // Показываем индикатор загрузки
        this.showLoading();
        
        // Имитация загрузки данных с сервера
        if (page.content.startsWith('http')) {
            try {
                const response = await fetch(page.content);
                page.content = await response.text();
            } catch (error) {
                page.content = '<p>Ошибка загрузки контента</p>';
            }
        }
        
        // Обновляем контент
        document.getElementById('app-content').innerHTML = page.content;
        document.title = page.title;
        
        // Скрываем индикатор загрузки
        this.hideLoading();
        
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
            const pageId = e.state?.pageId || 'home';
            this.renderPage(pageId);
        });
    }
    
    showLoading() {
        // Можно добавить индикатор загрузки
        console.log('Загрузка...');
    }
    
    hideLoading() {
        console.log('Загрузка завершена');
    }
    
    async loadInitialPage() {
        const initialPage = this.getCurrentPage() || 'home';
        await this.renderPage(initialPage);
    }
    
    getCurrentPage() {
        const path = window.location.hash.substring(1);
        return path || 'home';
    }
}

// Использование
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedSPA();
});
```

## Ключевые особенности этого SPA:

1. **Навигация без перезагрузки** - страницы меняются без полной перезагрузки
2. **Изменение URL** - обновляется hash в адресной строке
3. **History API** - работа с историей браузера
4. **Динамический контент** - возможность загрузки данных с сервера
5. **Простая маршрутизация** - определение активной страницы по URL

Этот пример демонстрирует основные принципы SPA: навигация между "страницами" происходит в рамках одного HTML-документа, контент подгружается динамически, а состояние приложения сохраняется в URL.
