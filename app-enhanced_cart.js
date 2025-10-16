class Cart {
    constructor() {
        if (Cart.instance) {
            return Cart.instance;
        }
        
        this.items = this.loadFromStorage();
        Cart.instance = this;
        
        return this;
    }
    
    loadFromStorage() {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }
    
    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                ...product,
                quantity: quantity
            });
        }
        
        this.saveToStorage();
        this.updateCartDisplay();
        this.showNotification(`"${product.name}" добавлен в корзину!`);
    }
    
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToStorage();
        this.updateCartDisplay();
    }
    
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveToStorage();
                this.updateCartDisplay();
            }
        }
    }
    
    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateCartDisplay();
    }
    
    getTotalCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
    
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    getItems() {
        return [...this.items];
    }
    
    updateCartDisplay() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.getTotalCount();
        }
    }
    
    showNotification(message) {
        // Создаем временное уведомление
        const notification = document.createElement('div');
        notification.className = 'success';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '1000';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

class EnhancedSPA {
    constructor() {
        this.cart = new Cart();
        this.products = [
            {
                id: 1,
                name: 'Игровой ноутбук',
                price: 50000,
                image: '💻',
                description: 'Мощный ноутбук для работы и игр с процессором Intel Core i7'
            },
            {
                id: 2,
                name: 'Смартфон',
                price: 25000,
                image: '📱',
                description: 'Современный смартфон с отличной камерой 48 МП'
            },
            {
                id: 3,
                name: 'Планшет',
                price: 35000,
                image: '📟',
                description: 'Легкий и производительный планшет с диагональю 10 дюймов'
            },
            {
                id: 4,
                name: 'Наушники',
                price: 15000,
                image: '🎧',
                description: 'Беспроводные наушники с шумоподавлением'
            },
            {
                id: 5,
                name: 'Умные часы',
                price: 12000,
                image: '⌚',
                description: 'Умные часы с отслеживанием активности и сном'
            },
            {
                id: 6,
                name: 'Фотокамера',
                price: 45000,
                image: '📷',
                description: 'Зеркальная камера для профессиональной съемки'
            }
        ];
        
        this.pages = {
            'home': { 
                url: '#home', 
                title: 'Главная - Магазин SPA',
                content: this.renderHome.bind(this)
            },
            'products': { 
                url: '#products', 
                title: 'Товары - Магазин SPA',
                content: this.renderProducts.bind(this)
            },
            'cart': { 
                url: '#cart', 
                title: 'Корзина - Магазин SPA',
                content: this.renderCart.bind(this)
            },
            'about': { 
                url: '#about', 
                title: 'О нас - Магазин SPA',
                content: this.renderAbout.bind(this)
            },
            'contact': { 
                url: '#contact', 
                title: 'Контакты - Магазин SPA', 
                content: this.renderContact.bind(this)
            }
        };
        
        this.init();
    }
    
    async init() {
        this.setupNavigation();
        await this.loadInitialPage();
        this.setupHistory();
        this.cart.updateCartDisplay();
    }
    
    setupNavigation() {
        document.addEventListener('click', (e) => {
            // Обработка навигации
            if (e.target.matches('nav a') || e.target.closest('nav a')) {
                e.preventDefault();
                const link = e.target.closest('a');
                const pageId = link.getAttribute('data-page');
                this.navigateTo(pageId);
            }
            
            // Обработка клика по корзине
            if (e.target.closest('.cart-info')) {
                e.preventDefault();
                this.navigateTo('cart');
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
        
        if (!page) {
            this.showError(`Страница "${pageId}" не найдена`);
            return;
        }
        
        this.showLoading();
        
        try {
            let content;
            
            if (typeof page.content === 'function') {
                content = await page.content();
            } else {
                content = await new Promise(resolve => {
                    setTimeout(() => resolve(page.content), 300);
                });
            }
            
            document.getElementById('app-content').innerHTML = content;
            document.title = page.title;
            this.updateActiveNav(pageId);
            
        } catch (error) {
            console.error('Ошибка загрузки страницы:', error);
            this.showError(`Ошибка загрузки страницы: ${error.message}`);
        }
    }
    
    updateActiveNav(pageId) {
        document.querySelectorAll('nav a').forEach(link => {
            const isActive = link.getAttribute('data-page') === pageId;
            link.classList.toggle('active', isActive);
        });
    }
    
    updateHistory(pageId) {
        const page = this.pages[pageId];
        if (page) {
            window.history.pushState({ pageId }, page.title, page.url);
        }
    }
    
    setupHistory() {
        window.addEventListener('popstate', (e) => {
            const pageId = e.state?.pageId || this.getCurrentPage() || 'home';
            this.renderPage(pageId);
        });
    }
    
    showLoading() {
        document.getElementById('app-content').innerHTML = '<div class="loading">Загрузка...</div>';
    }
    
    showError(message) {
        document.getElementById('app-content').innerHTML = `<div class="error">${message}</div>`;
    }
    
    async loadInitialPage() {
        const initialPage = this.getCurrentPage() || 'home';
        await this.renderPage(initialPage);
    }
    
    getCurrentPage() {
        const hash = window.location.hash.substring(1);
        return hash in this.pages ? hash : null;
    }
    
    // Методы рендеринга страниц
    renderHome() {
        return `
            <h2>Добро пожаловать в наш магазин!</h2>
            <p>Это современное SPA приложение с полным функционалом интернет-магазина.</p>
            
            <div style="margin: 2rem 0; padding: 2rem; background: #f8f9fa; border-radius: 8px;">
                <h3>🔥 Особенности:</h3>
                <ul style="margin: 1rem 0; padding-left: 2rem;">
                    <li>Добавление товаров в корзину</li>
                    <li>Управление количеством товаров</li>
                    <li>Сохранение корзины в localStorage</li>
                    <li>Красивый и отзывчивый интерфейс</li>
                    <li>Быстрая навигация без перезагрузки</li>
                </ul>
            </div>
            
            <button onclick="app.navigateTo('products')" 
                    style="padding: 1rem 2rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1.1rem;">
                🛍️ Начать покупки
            </button>
        `;
    }
    
    renderProducts() {
        const productsHTML = this.products.map(product => `
            <div class="product">
                <div style="font-size: 3rem; text-align: center; margin-bottom: 1rem;">${product.image}</div>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">${product.price.toLocaleString()} руб.</div>
                <button onclick="app.addToCart(${product.id})">
                    🛒 Добавить в корзину
                </button>
            </div>
        `).join('');
        
        return `
            <h2>Наши товары</h2>
            <p>Выберите понравившиеся товары и добавьте их в корзину:</p>
            <div class="products">
                ${productsHTML}
            </div>
        `;
    }
    
    renderCart() {
        const items = this.cart.getItems();
        
        if (items.length === 0) {
            return `
                <h2>🛒 Корзина</h2>
                <div class="empty-cart">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📭</div>
                    <h3>Ваша корзина пуста</h3>
                    <p>Добавьте товары из каталога</p>
                    <button onclick="app.navigateTo('products')" 
                            style="margin-top: 1rem; padding: 1rem 2rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Перейти к товарам
                    </button>
                </div>
            `;
        }
        
        const itemsHTML = items.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div style="font-size: 2rem;">${item.image}</div>
                    <div>
                        <h4>${item.name}</h4>
                        <p>${item.price.toLocaleString()} руб. × ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} руб.</p>
                    </div>
                </div>
                <div class="cart-item-controls">
                    <button onclick="app.updateCartItem(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="app.updateCartItem(${item.id}, ${item.quantity + 1})">+</button>
                    <button onclick="app.removeFromCart(${item.id})" style="margin-left: 1rem; color: #dc3545;">🗑️</button>
                </div>
            </div>
        `).join('');
        
        return `
            <h2>🛒 Корзина</h2>
            
            <div class="cart-items">
                ${itemsHTML}
            </div>
            
            <div class="cart-total">
                Итого: ${this.cart.getTotalPrice().toLocaleString()} руб.
            </div>
            
            <div class="cart-actions">
                <button class="btn-secondary" onclick="app.clearCart()">
                    Очистить корзину
                </button>
                <button class="btn-primary" onclick="app.checkout()">
                    Оформить заказ
                </button>
            </div>
        `;
    }
    
    renderAbout() {
        return `
            <h2>О нашем магазине</h2>
            <p>Мы - современный интернет-магазин, созданный с использованием передовых технологий.</p>
            
            <div style="margin-top: 2rem;">
                <h3>Наши преимущества:</h3>
                <ul style="margin: 1rem 0; padding-left: 2rem;">
                    <li>Быстрая доставка</li>
                    <li>Качественные товары</li>
                    <li>Поддержка 24/7</li>
                    <li>Удобный интерфейс</li>
                </ul>
            </div>
        `;
    }
    
    renderContact() {
        return `
            <h2>Контакты</h2>
            
            <div style="display: grid; gap: 2rem; margin-top: 2rem;">
                <div>
                    <h3>📞 Телефон</h3>
                    <p>+7 (999) 123-45-67</p>
                </div>
                
                <div>
                    <h3>📧 Email</h3>
                    <p>example@mail.com</p>
                </div>
                
                <div>
                    <h3>🏢 Адрес</h3>
                    <p>Москва, ул. Примерная, 123</p>
                </div>
                
                <div>
                    <h3>🕒 Время работы</h3>
                    <p>Пн-Пт: 9:00-18:00<br>Сб-Вс: 10:00-16:00</p>
                </div>
            </div>
        `;
    }
    
    // Методы для работы с корзиной
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            this.cart.addItem(product);
        }
    }
    
    removeFromCart(productId) {
        this.cart.removeItem(productId);
        // Если мы на странице корзины, перерисовываем её
        if (this.getCurrentPage() === 'cart') {
            this.renderPage('cart');
        }
    }
    
    updateCartItem(productId, quantity) {
        this.cart.updateQuantity(productId, quantity);
        // Если мы на странице корзины, перерисовываем её
        if (this.getCurrentPage() === 'cart') {
            this.renderPage('cart');
        }
    }
    
    clearCart() {
        this.cart.clear();
        this.renderPage('cart');
    }
    
    checkout() {
        if (this.cart.getTotalCount() === 0) {
            alert('Корзина пуста!');
            return;
        }
        
        const total = this.cart.getTotalPrice();
        const count = this.cart.getTotalCount();
        
        if (confirm(`Оформить заказ на ${total.toLocaleString()} руб. (${count} товаров)?`)) {
            alert('🎉 Заказ успешно оформлен! Спасибо за покупку!');
            this.cart.clear();
            this.renderPage('cart');
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EnhancedSPA();
});
