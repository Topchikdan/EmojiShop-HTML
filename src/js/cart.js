const STORAGE_KEY = 'smiles-shop:cart';

/** Прочитать корзину из localStorage. Возвращает массив id товаров. */
const readCart = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

/** Сохранить массив id товаров в localStorage. */
const writeCart = (ids) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

/** Проверить, лежит ли товар в корзине. */
export const isInCart = (id) => readCart().includes(id);

/** Добавить товар в корзину (без дублей). Возвращает новый размер корзины. */
export const addToCart = (id) => {
    const cart = readCart();
    if (!cart.includes(id)) {
        cart.push(id);
        writeCart(cart);
    }
    return cart.length;
};

/** Убрать товар из корзины. Возвращает новый размер корзины. */
export const removeFromCart = (id) => {
    const cart = readCart().filter((itemId) => itemId !== id);
    writeCart(cart);
    return cart.length;
};

/** Переключить товар в корзине. Возвращает { inCart, count }. */
export const toggleCart = (id) => {
    const inCart = isInCart(id);
    const count = inCart ? removeFromCart(id) : addToCart(id);
    return { inCart: !inCart, count };
};

/** Текущее количество товаров в корзине. */
export const getCartCount = () => readCart().length;
