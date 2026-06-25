import { getProducts } from './api.js';
import { renderCard } from './card.js';
import { getCartCount } from './cart.js';

const productsElement = document.querySelector('.shop__products');
const searchInput = document.querySelector('.shop__search');
const resultsCountElement = document.querySelector('.shop__count');
const cartCountElement = document.querySelector('.header__count');
const toastElement = document.querySelector('.toast');

let allProducts = [];
let toastTimeoutId = null;

/** Показать спиннер загрузки внутри сетки товаров. */
const renderLoading = () => {
    productsElement.innerHTML = `
        <div class="state">
            <div class="spinner"></div>
            <p class="state__title">Загружаем смайлики…</p>
        </div>
    `;
};

/** Показать сообщение об ошибке с кнопкой повторной попытки. */
const renderError = () => {
    productsElement.innerHTML = `
        <div class="state">
            <span class="material-symbols-outlined state__icon">error</span>
            <p class="state__title">Не удалось загрузить товары</p>
            <p class="state__text">Проверьте подключение к интернету и попробуйте снова.</p>
            <button type="button" class="state__retry">Повторить</button>
        </div>
    `;
    productsElement.querySelector('.state__retry').addEventListener('click', init);
};

/** Обновить счётчик результатов под поиском. */
const updateResultsCount = (count, total) => {
    if (!resultsCountElement) return;
    resultsCountElement.textContent =
        count === total
            ? `Всего товаров: ${total}`
            : `Найдено: ${count} из ${total}`;
};

/** Отфильтровать товары по строке поиска (название + описание, без учёта регистра). */
const filterProducts = (products, query) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;

    return products.filter(({ title, description }) =>
        title.toLowerCase().includes(normalized) ||
        (description ?? '').toLowerCase().includes(normalized)
    );
};

/** Перерисовать сетку с учётом текущего значения поиска. */
const applyFilterAndRender = () => {
    const query = searchInput.value;
    const filtered = filterProducts(allProducts, query);
    renderCard(filtered, query.trim());
    updateResultsCount(filtered.length, allProducts.length);
};

/** Показать всплывающее уведомление на пару секунд. */
const showToast = (message) => {
    if (!toastElement) return;
    toastElement.textContent = message;
    toastElement.classList.add('toast--visible');

    clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => {
        toastElement.classList.remove('toast--visible');
    }, 1800);
};

/** Обновить число в иконке корзины с небольшой анимацией. */
const updateCartBadge = () => {
    if (!cartCountElement) return;
    cartCountElement.textContent = getCartCount();
    cartCountElement.classList.remove('header__count--bump');
    // re-trigger animation
    requestAnimationFrame(() => cartCountElement.classList.add('header__count--bump'));
};

/** Слушаем кастомное событие "товар добавлен/удалён из корзины" от карточек. */
productsElement.addEventListener('cart-change', (event) => {
    updateCartBadge();
    showToast(event.detail.inCart ? 'Добавлено в корзину' : 'Убрано из корзины');
});

let debounceId = null;
searchInput?.addEventListener('input', () => {
    clearTimeout(debounceId);
    debounceId = setTimeout(applyFilterAndRender, 200);
});

/** Точка входа: загрузить товары и отрисовать их. */
async function init() {
    renderLoading();
    try {
        allProducts = await getProducts();
        applyFilterAndRender();
    } catch (error) {
        console.error('Не удалось получить список товаров:', error);
        renderError();
    }
}

updateCartBadge();
init();
