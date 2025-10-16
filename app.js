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
