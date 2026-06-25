import { getCartCount, removeFromCart } from './cart.js';
import { getProducts } from './api.js';

const itemsContainer = document.querySelector('.cart-page__items');
const summarySection = document.querySelector('.cart-page__summary');
const cartLayout = document.querySelector('.cart-page__layout');
const toastElement = document.querySelector('.toast');
const cartCountElement = document.querySelector('.header__count');

let toastTimeoutId = null;

/** Обновить счётчик в иконке корзины. */
const updateCartBadge = () => {
    if (!cartCountElement) return;
    cartCountElement.textContent = getCartCount();
    cartCountElement.classList.remove('header__count--bump');
    requestAnimationFrame(() => cartCountElement.classList.add('header__count--bump'));
};

/** Показать тост-уведомление. */
const showToast = (message) => {
    if (!toastElement) return;
    toastElement.textContent = message;
    toastElement.classList.add('toast--visible');
    clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => {
        toastElement.classList.remove('toast--visible');
    }, 1800);
};

/** Получить id-шники из localStorage. */
const getCartIds = () => {
    try {
        const raw = localStorage.getItem('smiles-shop:cart');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

/** Сформировать HTML строки итогов. */
const renderSummary = (items) => {
    const count = items.length;
    const total = items.reduce((sum, item) => sum + Number(item.price), 0);

    summarySection.querySelector('.cart-page__count-val').textContent = `${count} шт.`;
    summarySection.querySelector('.cart-page__total-val').textContent = `${total} Coin`;
};

/** Отрисовать пустое состояние корзины. */
const renderEmpty = () => {
    cartLayout.innerHTML = `
        <div class="cart-page__empty state">
            <span class="material-symbols-outlined state__icon">shopping_bag</span>
            <p class="state__title">Корзина пуста</p>
            <p class="state__text">Загляните в магазин — там есть отличные смайлики!</p>
            <a class="cart-page__back-link" href="index.html">
                <span class="material-symbols-outlined" style="font-size:16px">arrow_back</span>
                В магазин
            </a>
        </div>
    `;
};

/** Отрисовать список товаров в корзине. */
const renderItems = (items) => {
    itemsContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
        const el = document.createElement('div');
        el.className = 'cart-page__item';
        el.dataset.id = item.id;
        el.innerHTML = `
            <div class="cart-page__item-emoji">${item.title}</div>
            <div class="cart-page__item-info">
                <p class="cart-page__item-name">${item.title}</p>
                <p class="cart-page__item-desc">${item.description || ''}</p>
                <p class="cart-page__item-price">${item.price} Coin</p>
            </div>
            <button class="cart-page__item-remove" type="button" aria-label="Убрать ${item.title}">
                <span class="material-symbols-outlined">close</span>
            </button>
        `;

        el.querySelector('.cart-page__item-remove').addEventListener('click', () => {
            removeFromCart(item.id);
            el.style.transition = 'opacity 0.2s, transform 0.2s';
            el.style.opacity = '0';
            el.style.transform = 'translateX(16px)';
            setTimeout(() => {
                el.remove();
                updateCartBadge();
                showToast('Убрано из корзины');
                // Если корзина опустела — показываем пустое состояние
                if (getCartIds().length === 0) {
                    renderEmpty();
                } else {
                    // Пересчитываем итоги
                    const remaining = items.filter((p) => p.id !== item.id);
                    renderSummary(remaining);
                    // Убираем из массива
                    items.splice(items.indexOf(item), 1);
                }
            }, 200);
        });

        fragment.append(el);
    });

    itemsContainer.append(fragment);
};

/** Инициализация страницы корзины. */
async function init() {
    const ids = getCartIds();

    if (ids.length === 0) {
        renderEmpty();
        return;
    }

    // Показываем лоадер в списке
    itemsContainer.innerHTML = `
        <div class="state" style="grid-column:1/-1">
            <div class="spinner"></div>
            <p class="state__title">Загружаем корзину…</p>
        </div>
    `;

    try {
        const allProducts = await getProducts();
        const cartItems = ids
            .map((id) => allProducts.find((p) => String(p.id) === String(id)))
            .filter(Boolean);

        if (cartItems.length === 0) {
            renderEmpty();
            return;
        }

        renderItems(cartItems);
        renderSummary(cartItems);

        // Обновить счётчик в шапке
        updateCartBadge();

        // Кнопка «Оформить заказ»
        document.querySelector('.cart-page__checkout-btn')?.addEventListener('click', () => {
            showToast('Заказ оформлен! 🎉');
        });

        // Кнопка «Очистить корзину»
        document.querySelector('.cart-page__clear-btn')?.addEventListener('click', () => {
            ids.forEach((id) => removeFromCart(id));
            renderEmpty();
            updateCartBadge();
            showToast('Корзина очищена');
        });

    } catch (err) {
        console.error('Не удалось загрузить товары:', err);
        itemsContainer.innerHTML = `
            <div class="state">
                <span class="material-symbols-outlined state__icon">error</span>
                <p class="state__title">Не удалось загрузить корзину</p>
                <p class="state__text">Проверьте подключение и попробуйте обновить страницу.</p>
            </div>
        `;
    }
}

updateCartBadge();
init();
