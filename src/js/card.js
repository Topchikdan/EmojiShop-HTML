import { isInCart, toggleCart } from './cart.js';

const productsElement = document.querySelector('.shop__products');

/** Создать DOM-узел одной карточки товара. */
const createCard = ({ id, description, title, price }) => {
    const productElement = document.createElement('div');
    productElement.className = 'shop__product';

    // Эмодзи
    const emojiWrap = document.createElement('div');
    emojiWrap.className = 'shop__emoji-wrap';
    const titleElement = document.createElement('h2');
    titleElement.className = 'shop__title';
    titleElement.textContent = title;
    emojiWrap.append(titleElement);
    productElement.append(emojiWrap);

    // Название (дублируем title текстом, чтобы карточка не выглядела пустой для скринридеров)
    const nameElement = document.createElement('p');
    nameElement.className = 'shop__name';
    nameElement.textContent = title;
    productElement.append(nameElement);

    // Описание
    const descriptionElement = document.createElement('p');
    descriptionElement.className = 'shop__description';
    descriptionElement.textContent = description;
    descriptionElement.title = description;
    productElement.append(descriptionElement);

    // Цена
    const priceElement = document.createElement('p');
    priceElement.className = 'shop__price';
    priceElement.innerHTML = `Цена: <span class="shop__price-value">${price} Coin</span>`;
    productElement.append(priceElement);

    // Кнопка "в корзину"
    const buttonBlok = document.createElement('div');
    buttonBlok.className = 'shop__button-blok';

    const buttonElement = document.createElement('button');
    buttonElement.type = 'button';
    buttonElement.className = 'shop__button';

    const setButtonState = (inCart) => {
        buttonElement.textContent = inCart ? 'В корзине ✓' : 'В корзину';
        buttonElement.classList.toggle('shop__button--in-cart', inCart);
    };

    setButtonState(isInCart(id));

    buttonElement.addEventListener('click', () => {
        const { inCart, count } = toggleCart(id);
        setButtonState(inCart);
        productElement.dispatchEvent(
            new CustomEvent('cart-change', { bubbles: true, detail: { inCart, count } })
        );
    });

    buttonBlok.append(buttonElement);
    productElement.append(buttonBlok);

    return productElement;
};

/** Показать "пусто" сообщение, когда поиск не дал результатов. */
const createEmptyState = (query) => {
    const state = document.createElement('div');
    state.className = 'state';
    state.innerHTML = `
        <span class="material-symbols-outlined state__icon">search_off</span>
        <p class="state__title">Ничего не найдено</p>
        <p class="state__text">По запросу «${query}» смайликов не нашлось. Попробуйте другой запрос.</p>
    `;
    return state;
};

/**
 * Отрисовать список товаров в контейнер .shop__products.
 * Контейнер очищается перед каждой отрисовкой, поэтому функцию
 * безопасно вызывать повторно (например, при поиске).
 */
export const renderCard = (products, searchQuery = '') => {
    productsElement.innerHTML = '';

    if (products.length === 0) {
        productsElement.append(createEmptyState(searchQuery));
        return;
    }

    const fragment = document.createDocumentFragment();
    products.forEach((product) => {
        fragment.append(createCard(product));
    });
    productsElement.append(fragment);
};
