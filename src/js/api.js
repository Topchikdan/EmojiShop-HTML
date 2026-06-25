const API_URL = 'https://6a3c21e6e4a07f202e167825.mockapi.io/smiles';

/**
 * Получить список товаров с сервера.
 * Бросает ошибку, если запрос не удался — обработка происходит в index.js.
 */
export const getProducts = async () => {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(`Сервер ответил с ошибкой: ${response.status}`);
    }

    const data = await response.json();

    return data;
};
