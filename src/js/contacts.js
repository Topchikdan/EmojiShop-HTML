import { getCartCount } from './cart.js';

const cartCountElement = document.querySelector('.header__count');
const toastElement = document.querySelector('.toast');
const contactForm = document.querySelector('.contacts__form');

let toastTimeoutId = null;

const showToast = (message) => {
    if (!toastElement) return;
    toastElement.textContent = message;
    toastElement.classList.add('toast--visible');
    clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => {
        toastElement.classList.remove('toast--visible');
    }, 2500);
};

const updateCartBadge = () => {
    if (!cartCountElement) return;
    cartCountElement.textContent = getCartCount();
};

contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.contacts__submit');
    btn.textContent = 'Отправляем…';
    btn.disabled = true;

    // Имитация отправки
    setTimeout(() => {
        contactForm.reset();
        btn.textContent = 'Отправить сообщение';
        btn.disabled = false;
        showToast('Сообщение отправлено! Мы ответим в ближайшее время 💌');
    }, 1200);
});

updateCartBadge();
