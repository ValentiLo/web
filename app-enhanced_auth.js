class AuthService {
    constructor() {
        if (AuthService.instance) {
            return AuthService.instance;
        }
        
        this.currentUser = null;
        this.users = this.loadUsers();
        AuthService.instance = this;
        
        return this;
    }
    
    loadUsers() {
        const saved = localStorage.getItem('users');
        const users = saved ? JSON.parse(saved) : [];
        
        // Добавляем тестового пользователя если нет пользователей
        if (users.length === 0) {
            const testUser = {
                id: 1,
                username: 'admin',
                email: 'admin@example.com',
                password: 'admin123',
                createdAt: new Date().toISOString()
            };
            users.push(testUser);
            this.saveUsers(users);
        }
        
        return users;
    }
    
    saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    register(username, email, password) {
        // Проверяем, нет ли уже пользователя с таким username или email
        const existingUser = this.users.find(user => 
            user.username === username || user.email === email
        );
        
        if (existingUser) {
            throw new Error('Пользователь с таким именем или email уже существует');
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: Date.now(),
            username,
            email,
            password, // В реальном приложении пароль должен хэшироваться!
            createdAt: new Date().toISOString()
        };
        
        this.users.push(newUser);
        this.saveUsers(this.users);
        
        return newUser;
    }
    
    login(username, password) {
        const user = this.users.find(u => 
            u.username === username && u.password === password
        );
        
        if (!user) {
            throw new Error('Неверное имя пользователя или пароль');
        }
        
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        return user;
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }
    
    getCurrentUser() {
        if (!this.currentUser) {
            const saved = localStorage.getItem('currentUser');
            this.currentUser = saved ? JSON.parse(saved) : null;
        }
        return this.currentUser;
    }
    
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }
    
    getAllUsers() {
        return [...this.users];
    }
}

class Cart {
    constructor() {
        if (Cart.instance) {
            return Cart.instance;
        }
        
        this.auth = new AuthService();
        Cart.instance = this;
        
        return this;
    }
    
    getStorageKey() {
        const user = this.auth.getCurrentUser();
        return user ? `cart_${user.id}` : 'cart_guest';
    }
    
    loadFromStorage() {
        const key = this.getStorageKey();
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
    }
    
    saveToStorage(items) {
        const key = this.getStorageKey();
        localStorage.setItem(key, JSON.stringify(items));
    }
    
    getItems() {
        return this.loadFromStorage();
    }
    
    addItem(product, quantity = 1) {
        const items = this.loadFromStorage();
        const existingItem = items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            items.push({
                ...product,
                quantity: quantity
            });
        }
        
        this.saveToStorage(items);
        this.updateCartDisplay();
        this.showNotification(`"${product.name}" добавлен в корзину!`);
    }
    
    removeItem(productId) {
        const items = this.loadFromStorage();
        const filteredItems = items.filter(item => item.id !== productId);
        this.saveToStorage(filteredItems);
        this.updateCartDisplay();
    }
    
    updateQuantity(productId, quantity) {
        const items = this.loadFromStorage();
        const item = items.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveToStorage(items);
                this.updateCartDisplay();
            }
        }
    }
    
    clear() {
        this.saveToStorage([]);
        this.updateCartDisplay();
    }
    
    getTotalCount() {
        const items = this.loadFromStorage();
        return items.reduce((total, item) => total + item.quantity, 0);
    }
    
    getTotalPrice() {
        const items = this.loadFromStorage();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    updateCartDisplay() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.getTotalCount();
        }
    }
    
    showNotification(message) {
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
    
    // Перенос корзины при авторизации
    transferCartFromGuest(userId) {
        const guestCart = localStorage.getItem('cart_guest');
        if (guestCart) {
            localStorage.setItem(`cart_${userId}`, guestCart);
            localStorage.removeItem('cart_guest');
        }
        this.updateCartDisplay();
    }
}

class EnhancedSPA {
    constructor() {
        this.auth = new AuthService();
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
            'login': { 
                url: '#login', 
                title: 'Вход - Магазин SPA',
                content: this.renderLogin.bind(this)
            },
            'register': { 
                url: '#register', 
                title: 'Регистрация - Магазин SPA',
                content: this.renderRegister.bind(this)
            },
            'profile': { 
                url: '#profile', 
                title: 'Профиль - Магазин SPA',
                content: this.renderProfile.bind(this)
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
        this.updateAuthUI();
        this.cart.updateCartDisplay();
    }
    
    setupNavigation() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('nav a') || e.target.closest('nav a')) {
                e.preventDefault();
                const link = e.target.closest('a');
                const pageId = link.getAttribute('data-page');
                this.navigateTo(pageId);
            }
            
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
    
    showSuccess(message) {
        const contentElement = document.getElementById('app-content');
        contentElement.innerHTML = `
            <div class="success">${message}</div>
            ${contentElement.innerHTML}
        `;
        
        setTimeout(() => {
            const successElement = contentElement.querySelector('.success');
            if (successElement) {
                successElement.remove();
            }
        }, 3000);
    }
    
    async loadInitialPage() {
        const initialPage = this.getCurrentPage() || 'home';
        await this.renderPage(initialPage);
    }
    
    getCurrentPage() {
        const hash = window.location.hash.substring(1);
        return hash in this.pages ? hash : null;
    }
    
    // Обновление UI авторизации
    updateAuthUI() {
        const authSection = document.getElementById('user-auth-section');
        const user = this.auth.getCurrentUser();
        
        if (user) {
            authSection.innerHTML = `
                <div class="user-info">
                    <span>👤 ${user.username}</span>
                </div>
                <div class="auth-buttons">
                    <a href="#profile" class="btn btn-outline" data-page="profile">Профиль</a>
                    <button class="btn btn-danger" onclick="app.logout()">Выйти</button>
                </div>
            `;
        } else {
            authSection.innerHTML = `
                <div class="auth-buttons">
                    <a href="#login" class="btn btn-outline" data-page="login">Войти</a>
                    <a href="#register" class="btn btn-primary" data-page="register">Регистрация</a>
                </div>
            `;
        }
        
        // Обновляем обработчики событий для новых ссылок
        this.setupNavigation();
    }
    
    // Методы рендеринга страниц
    renderHome() {
        const user = this.auth.getCurrentUser();
        const welcomeMessage = user ? 
            `, ${user.username}!` : '!';
            
        return `
            <h2>Добро пожаловать в наш магазин${welcomeMessage}</h2>
            <p>Это современное SPA приложение с системой авторизации и персональными корзинами.</p>
            
            <div style="margin: 2rem 0; padding: 2rem; background: #f8f9fa; border-radius: 8px;">
                <h3>🔥 Новые возможности:</h3>
                <ul style="margin: 1rem 0; padding-left: 2rem;">
                    <li>🔐 Система авторизации</li>
                    <li>👤 Персональные корзины</li>
                    <li>📱 Сохранение данных между сессиями</li>
                    <li>🔄 Автоперенос корзины при входе</li>
                    <li>👥 Управление пользователями (для админа)</li>
                </ul>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button onclick="app.navigateTo('products')" 
                        class="btn btn-primary" style="padding: 1rem 2rem;">
                    🛍️ Начать покупки
                </button>
                
                ${!user ? `
                    <button onclick="app.navigateTo('register')" 
                            class="btn btn-outline" style="padding: 1rem 2rem;">
                        👤 Зарегистрироваться
                    </button>
                ` : ''}
            </div>
            
            ${user ? `
                <div style="margin-top: 2rem; padding: 1rem; background: #e7f3ff; border-radius: 8px;">
                    <h4>Ваша корзина</h4>
                    <p>Товаров в корзине: <strong>${this.cart.getTotalCount()}</strong></p>
                    <p>Общая сумма: <strong>${this.cart.getTotalPrice().toLocaleString()} руб.</strong></p>
                    <button onclick="app.navigateTo('cart')" class="btn btn-primary" style="margin-top: 0.5rem;">
                        Перейти в корзину
                    </button>
                </div>
            ` : ''}
        `;
    }
    
    renderProducts() {
        const isAuthenticated = this.auth.isAuthenticated();
        const productsHTML = this.products.map(product => `
            <div class="product">
                <div style="font-size: 3rem; text-align: center; margin-bottom: 1rem;">${product.image}</div>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">${product.price.toLocaleString()} руб.</div>
                <button onclick="app.addToCart(${product.id})" ${!isAuthenticated ? 'disabled' : ''}>
                    ${isAuthenticated ? '🛒 Добавить в корзину' : '🔒 Войдите для покупок'}
                </button>
            </div>
        `).join('');
        
        return `
            <h2>Наши товары</h2>
            ${!isAuthenticated ? `
                <div class="error" style="margin-bottom: 1rem;">
                    🔒 Для добавления товаров в корзину необходимо <a href="#login" data-page="login" style="color: inherit; text-decoration: underline;">войти в систему</a>
                </div>
            ` : ''}
            <div class="products">
                ${productsHTML}
            </div>
        `;
    }
    
    renderCart() {
        const isAuthenticated = this.auth.isAuthenticated();
        
        if (!isAuthenticated) {
            return `
                <h2>🛒 Корзина</h2>
                <div class="error">
                    <h3>🔒 Требуется авторизация</h3>
                    <p>Для просмотра корзины необходимо войти в систему</p>
                    <div style="margin-top: 1rem;">
                        <a href="#login" data-page="login" class="btn btn-primary">Войти</a>
                        <a href="#register" data-page="register" class="btn btn-outline" style="margin-left: 0.5rem;">Регистрация</a>
                    </div>
                </div>
            `;
        }
        
        const items = this.cart.getItems();
        
        if (items.length === 0) {
            return `
                <h2>🛒 Корзина</h2>
                <div class="empty-cart">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📭</div>
                    <h3>Ваша корзина пуста</h3>
                    <p>Добавьте товары из каталога</p>
                    <button onclick="app.navigateTo('products')" class="btn btn-primary" style="margin-top: 1rem;">
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
            <p>Пользователь: <strong>${this.auth.getCurrentUser().username}</strong></p>
            
            <div class="cart-items">
                ${itemsHTML}
            </div>
            
            <div class="cart-total">
                Итого: ${this.cart.getTotalPrice().toLocaleString()} руб.
            </div>
            
            <div class="cart-actions">
                <button class="btn btn-danger" onclick="app.clearCart()">
                    Очистить корзину
                </button>
                <button class="btn btn-primary" onclick="app.checkout()">
                    Оформить заказ
                </button>
            </div>
        `;
    }
    
    renderLogin() {
        return `
            <div class="auth-form">
                <h2>Вход в систему</h2>
                
                <form onsubmit="app.handleLogin(event)">
                    <div class="form-group">
                        <label for="username">Имя пользователя:</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Пароль:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="app.navigateTo('home')">
                            Назад
                        </button>
                        <button type="submit" class="btn btn-primary">
                            Войти
                        </button>
                    </div>
                </form>
                
                <div style="text-align: center; margin-top: 1rem;">
                    <p>Нет аккаунта? <a href="#register" data-page="register">Зарегистрируйтесь</a></p>
                </div>
                
                <div style="margin-top: 2rem; padding: 1rem; background: #fff3cd; border-radius: 4px;">
                    <h4>Тестовый аккаунт:</h4>
                    <p><strong>Логин:</strong> admin</p>
                    <p><strong>Пароль:</strong> admin123</p>
                </div>
            </div>
        `;
    }
    
    renderRegister() {
        return `
            <div class="auth-form">
                <h2>Регистрация</h2>
                
                <form onsubmit="app.handleRegister(event)">
                    <div class="form-group">
                        <label for="reg-username">Имя пользователя:</label>
                        <input type="text" id="reg-username" name="username" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="reg-email">Email:</label>
                        <input type="email" id="reg-email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="reg-password">Пароль:</label>
                        <input type="password" id="reg-password" name="password" required>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="app.navigateTo('home')">
                            Назад
                        </button>
                        <button type="submit" class="btn btn-primary">
                            Зарегистрироваться
                        </button>
                    </div>
                </form>
                
                <div style="text-align: center; margin-top: 1rem;">
                    <p>Уже есть аккаунт? <a href="#login" data-page="login">Войдите</a></p>
                </div>
            </div>
        `;
    }
    
    renderProfile() {
        const user = this.auth.getCurrentUser();
        
        if (!user) {
            return `
                <div class="error">
                    <p>Для просмотра профиля необходимо войти в систему</p>
                    <div style="margin-top: 1rem;">
                        <a href="#login" data-page="login" class="btn btn-primary">Войти</a>
                    </div>
                </div>
            `;
        }
        
        const isAdmin = user.username === 'admin';
        const usersList = isAdmin ? this.renderUsersList() : '';
        
        return `
            <h2>👤 Профиль пользователя</h2>
            
            <div class="profile-info">
                <h3>${user.username}</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Зарегистрирован:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                <p><strong>Товаров в корзине:</strong> ${this.cart.getTotalCount()}</p>
                <p><strong>Сумма корзины:</strong> ${this.cart.getTotalPrice().toLocaleString()} руб.</p>
            </div>
            
            <div style="display: flex; gap: 1rem; margin: 2rem 0;">
                <button onclick="app.navigateTo('cart')" class="btn btn-primary">
                    🛒 Перейти в корзину
                </button>
                <button onclick="app.logout()" class="btn btn-danger">
                    🚪 Выйти
                </button>
            </div>
            
            ${usersList}
        `;
    }
    
    renderUsersList() {
        const users = this.auth.getAllUsers();
        const usersHTML = users.map(user => `
            <div class="user-card">
                <div>
                    <strong>${user.username}</strong>
                    <div style="font-size: 0.9rem; color: #666;">
                        ${user.email} • ${new Date(user.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div>
                    ${user.username === 'admin' ? '<span style="color: #dc3545;">👑 Админ</span>' : '👤 Пользователь'}
                </div>
            </div>
        `).join('');
        
        return `
            <div class="users-list">
                <h3>👥 Все пользователи (только для админа)</h3>
                <p>Всего пользователей: ${users.length}</p>
                ${usersHTML}
            </div>
        `;
    }
    
    renderAbout() {
        return `
            <h2>О нашем магазине</h2>
            <p>Мы - современный интернет-магазин с системой авторизации и персональными корзинами.</p>
            
            <div style="margin-top: 2rem;">
                <h3>Технологии:</h3>
                <ul style="margin: 1rem 0; padding-left: 2rem;">
                    <li>Single Page Application (SPA)</li>
                    <li>Система авторизации</li>
                    <li>Персональные корзины</li>
                    <li>LocalStorage для сохранения данных</li>
                    <li>Адаптивный дизайн</li>
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
    
    // Обработчики форм
    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const username = formData.get('username');
        const password = formData.get('password');
        
        try {
            const user = this.auth.login(username, password);
            
            // Переносим корзину из гостевой в персональную
            this.cart.transferCartFromGuest(user.id);
            
            this.showSuccess(`Добро пожаловать, ${user.username}!`);
            this.updateAuthUI();
            this.navigateTo('home');
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    async handleRegister(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        
        try {
            const user = this.auth.register(username, email, password);
            
            // Автоматически логиним после регистрации
            this.auth.login(username, password);
            this.cart.transferCartFromGuest(user.id);
            
            this.showSuccess(`Регистрация успешна! Добро пожаловать, ${user.username}!`);
            this.updateAuthUI();
            this.navigateTo('home');
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    logout() {
        this.auth.logout();
        this.updateAuthUI();
        this.showSuccess('Вы успешно вышли из системы');
        this.navigateTo('home');
    }
    
    // Методы для работы с корзиной
    addToCart(productId) {
        if (!this.auth.isAuthenticated()) {
            this.showError('Для добавления товаров в корзину необходимо войти в систему');
            this.navigateTo('login');
            return;
        }
        
        const product = this.products.find(p => p.id === productId);
        if (product) {
            this.cart.addItem(product);
        }
    }
    
    removeFromCart(productId) {
        this.cart.removeItem(productId);
        if (this.getCurrentPage() === 'cart') {
            this.renderPage('cart');
        }
    }
    
    updateCartItem(productId, quantity) {
        this.cart.updateQuantity(productId, quantity);
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
            this.showError('Корзина пуста!');
            return;
        }
        
        const total = this.cart.getTotalPrice();
        const count = this.cart.getTotalCount();
        const user = this.auth.getCurrentUser();
        
        if (confirm(`${user.username}, оформить заказ на ${total.toLocaleString()} руб. (${count} товаров)?`)) {
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
